import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { buildPdfSections } from './exportHtml'

// A4 in points
const PAGE_WIDTH = 595.28
const PAGE_HEIGHT = 841.89
const MARGIN = 40

const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2
const CONTENT_HEIGHT = PAGE_HEIGHT - MARGIN * 2

const PAGE_BG = '#fffdf8' // warm paper card tone

function sanitizeFilename(name, fallback) {
  const clean = String(name || '')
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
  return (clean || fallback).slice(0, 120)
}

function makeContainer() {
  const container = document.createElement('div')
  container.style.position = 'absolute'
  container.style.left = '-10000px'
  container.style.top = '0'
  container.style.width = '700px'
  container.style.background = PAGE_BG
  container.style.zIndex = '-1'
  return container
}

function waitForImages(container) {
  const imgs = Array.from(container.querySelectorAll('img'))
  return Promise.all(
    imgs.map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete) return resolve()
          img.onload = resolve
          img.onerror = resolve
        })
    )
  )
}

const RENDER_SCALE = 2
// Keep every rendered canvas dimension well below browser limits (Firefox caps
// any dimension at 32,767px; Safari/Chrome enforce total-area limits) so long
// notes never silently produce blank canvases/pages.
const MAX_CANVAS_DIM = 10000

// Split the element into page-sized [start, end) CSS-pixel ranges, preferring
// to break just above a block element so lines of text, list items and images
// are never sliced in half at a page boundary.
function computePageRanges(element, pageCssHeight) {
  const totalHeight = element.scrollHeight
  const containerTop = element.getBoundingClientRect().top
  const candidates = []
  element
    .querySelectorAll('p, h1, h2, h3, h4, ul, ol, li, blockquote, pre, hr, img, table, div')
    .forEach((el) => {
      const top = el.getBoundingClientRect().top - containerTop
      if (top > 0 && top < totalHeight) candidates.push(top)
    })
  candidates.sort((a, b) => a - b)
  const ranges = []
  let start = 0
  while (totalHeight - start > pageCssHeight) {
    const limit = start + pageCssHeight
    let cut = limit
    // Largest block boundary that still fits on this page; fall back to the
    // fixed slice when no boundary makes enough progress (one huge element).
    for (let i = candidates.length - 1; i >= 0; i -= 1) {
      if (candidates[i] <= limit) {
        if (candidates[i] > start + pageCssHeight * 0.25) cut = candidates[i]
        break
      }
    }
    ranges.push({ start, end: cut })
    start = cut
  }
  ranges.push({ start, end: totalHeight })
  return ranges
}

function assertCanvasRendered(canvas) {
  let ok = canvas && canvas.width > 0 && canvas.height > 0
  if (ok) {
    try {
      canvas.getContext('2d').getImageData(0, 0, 1, 1)
    } catch {
      ok = false
    }
  }
  if (!ok) throw new Error('PDF export failed: content could not be rendered to canvas')
}

async function renderRegion(element, cssY, cssHeight, renderWhole) {
  const options = {
    scale: RENDER_SCALE,
    backgroundColor: PAGE_BG,
    useCORS: true,
    logging: false,
  }
  if (!renderWhole) {
    // Crop options are in document coordinates.
    const docTop = element.getBoundingClientRect().top + window.scrollY
    options.y = docTop + cssY
    options.height = cssHeight
    options.windowHeight = Math.max(window.innerHeight, docTop + cssY + cssHeight)
  }
  const canvas = await html2canvas(element, options)
  assertCanvasRendered(canvas)
  return canvas
}

async function addElementPages(pdf, element, isFirstPage) {
  const cssWidth = element.offsetWidth || 700
  const pageCssHeight = Math.floor((CONTENT_HEIGHT * cssWidth) / CONTENT_WIDTH)
  const ranges = computePageRanges(element, pageCssHeight)

  // Group consecutive pages into chunks and render one canvas per chunk, so a
  // very long note never exceeds browser canvas limits in a single render.
  const maxChunkCssHeight = Math.max(pageCssHeight, Math.floor(MAX_CANVAS_DIM / RENDER_SCALE))
  const chunks = []
  let chunk = null
  for (const range of ranges) {
    if (!chunk || range.end - chunk.start > maxChunkCssHeight) {
      chunk = { start: range.start, end: range.end, ranges: [] }
      chunks.push(chunk)
    }
    chunk.end = range.end
    chunk.ranges.push(range)
  }

  // A single small chunk fits in one canvas: render the element whole (the
  // common case) and only use cropped renders when chunking is required.
  const renderWhole = chunks.length === 1
  let first = isFirstPage
  for (const c of chunks) {
    const canvas = await renderRegion(element, c.start, c.end - c.start, renderWhole)
    const pxPerCss = canvas.width / cssWidth
    const pxPerPt = canvas.width / CONTENT_WIDTH
    for (const range of c.ranges) {
      const sliceY = Math.max(0, Math.round((range.start - c.start) * pxPerCss))
      const sliceHeight = Math.min(
        Math.round((range.end - range.start) * pxPerCss),
        canvas.height - sliceY
      )
      if (sliceHeight <= 0) continue
      const slice = document.createElement('canvas')
      slice.width = canvas.width
      slice.height = sliceHeight
      const ctx = slice.getContext('2d')
      ctx.fillStyle = PAGE_BG
      ctx.fillRect(0, 0, slice.width, slice.height)
      ctx.drawImage(canvas, 0, sliceY, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight)
      if (!first) pdf.addPage()
      first = false
      pdf.addImage(
        slice.toDataURL('image/jpeg', 0.92),
        'JPEG',
        MARGIN,
        MARGIN,
        CONTENT_WIDTH,
        sliceHeight / pxPerPt
      )
    }
  }
  return true
}

// Export the given scope ('topic' | 'chapter' | 'subject') as a warm-paper PDF:
// one topic per section, chapter/subject title pages, block-boundary-aware slicing.
export async function exportScopedPdf(scope, { subject, chapter, topic }) {
  const { name, sections } = buildPdfSections(scope, { subject, chapter, topic })
  if (!sections.length) throw new Error('Nothing to export')
  const container = makeContainer()
  document.body.appendChild(container)
  try {
    const pdf = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' })
    let first = true
    for (const html of sections) {
      container.innerHTML = html
      await waitForImages(container)
      await addElementPages(pdf, container, first)
      first = false
    }
    pdf.save(`${sanitizeFilename(name, 'inkbook')}.pdf`)
  } finally {
    container.remove()
  }
}
