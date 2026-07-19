// Compiled warm-paper HTML for print + PDF — block markup copied from the
// prototype's compileHtml() (Design/Notebook.dc.html), extended with an image case.
import { sanitizeHtml, sanitizeSvg, linkifyHtml } from './richtext'

const esc = (s) =>
  String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export function blockHtml(block) {
  const p = block.payload || {}
  switch (block.type) {
    case 'text':
      return `<p style="font-size:14px;line-height:1.8;margin:0 0 10px">${sanitizeHtml(linkifyHtml(p.html))}</p>`
    case 'math':
      return `<div style="text-align:center;font-family:monospace;border:1px dashed #d9c8a8;border-radius:8px;padding:10px;margin:0 0 10px">${esc(p.text)}</div>`
    case 'code':
      return `<pre style="background:#f4efe4;border:1px solid #e0d3bc;border-radius:8px;padding:10px;font-size:12px;white-space:pre-wrap;margin:0 0 10px">${esc(p.text)}</pre>`
    case 'code2':
      return `<pre style="background:#f4efe4;border:1px solid #e0d3bc;border-radius:8px;padding:10px;font-size:12px;white-space:pre-wrap;margin:0 0 10px">BEFORE:\n${esc(p.before)}\n\nAFTER:\n${esc(p.after)}</pre>`
    case 'todo':
      return `<div style="font-size:14px;margin:0 0 8px">${p.done ? '☑' : '☐'} ${esc(p.text)}</div>`
    case 'link':
      return `<div style="font-size:13px;margin:0 0 8px">🔗 ${esc(p.text)} — ${esc(p.url)}</div>`
    case 'table':
      return `<table style="border-collapse:collapse;margin:0 0 10px">${(p.rows || [])
        .map(
          (r, i) =>
            `<tr>${r
              .map(
                (c) =>
                  `<td style="border:1px solid #cdbb96;padding:5px 10px;font-size:13px;${i === 0 ? 'font-weight:600;background:#efe6d6' : ''}">${esc(c)}</td>`
              )
              .join('')}</tr>`
        )
        .join('')}</table>`
    case 'diagram':
      return `<div style="text-align:center;margin:0 0 10px">${sanitizeSvg(p.svg)}<div style="font-size:11px;color:#9a875f">${esc(p.caption)}</div></div>`
    case 'image':
      return p.url
        ? `<div style="text-align:center;margin:0 0 10px"><img src="${esc(p.url)}" style="max-width:100%;max-height:420px"/><div style="font-size:11px;color:#9a875f">${esc(p.caption)}</div></div>`
        : ''
    case 'scan':
      return `<div style="font-style:italic;color:#5a5248;border:1px solid #e0d3bc;border-radius:8px;padding:10px;font-size:13px;margin:0 0 10px">${esc(p.transcript)}</div>`
    default:
      return ''
  }
}

export function topicHtml(topic) {
  return `<div style="margin:0 0 26px"><h2 style="font-size:19px;border-bottom:2px solid #b8552e;padding-bottom:4px;margin:0 0 10px">${esc(topic.name)}</h2>${(topic.blocks || []).map(blockHtml).join('')}</div>`
}

function chapterFlowHtml(subject, chapter) {
  return (
    `<h1 style="font-size:24px;margin:0 0 4px">${esc(subject.name)} › ${esc(chapter.name)}</h1>` +
    `<div style="font-size:11px;color:#9a875f;font-family:sans-serif;margin:0 0 18px">${chapter.topics.length} topics · printed from Inkbook</div>` +
    chapter.topics.map(topicHtml).join('')
  )
}

// Scoped print view (matches prototype compileHtml exactly for chapter/subject).
export function compilePrintHtml(subjects, scope, ctx) {
  const subject = subjects.find((s) => s._id === ctx.subjectId)
  if (!subject) return ''
  if (scope === 'subject') {
    return (
      `<h1 style="font-size:28px;margin:0 0 18px">${esc(subject.name)}</h1>` +
      subject.chapters
        .map((c) => `<div style="page-break-before:auto;margin:0 0 30px">${chapterFlowHtml(subject, c)}</div>`)
        .join('')
    )
  }
  const chapter = subject.chapters.find((c) => c.id === ctx.chapterId)
  return chapter ? chapterFlowHtml(subject, chapter) : ''
}

/* ── PDF sections (one fresh page per section) ── */

const SECTION_STYLE =
  `padding:40px 46px;background:#fffdf8;color:#3a3128;font-family:'Lora',serif`
const META_STYLE = `font-family:'Source Sans 3',sans-serif;font-size:12px;color:#9a875f`
const LABEL_STYLE =
  `font-family:'Source Sans 3',sans-serif;font-size:11px;font-weight:700;letter-spacing:.08em;color:#9a875f;text-transform:uppercase`

function pdfTopicSection(topic) {
  return `<div style="${SECTION_STYLE}">${topicHtml(topic)}</div>`
}

function pdfChapterTitlePage(subject, chapter) {
  return (
    `<div style="${SECTION_STYLE};padding-top:120px">` +
    `<div style="${LABEL_STYLE}">Chapter</div>` +
    `<h1 style="font-size:30px;margin:6px 0 12px">${esc(chapter.name)}</h1>` +
    `<div style="width:64px;height:3px;border-radius:2px;background:#b8552e;margin:0 0 16px"></div>` +
    `<div style="${META_STYLE}">${esc(subject.name)} · ${chapter.topics.length} topics · exported from Inkbook</div>` +
    `</div>`
  )
}

function pdfSubjectTitlePage(subject) {
  const topicCount = subject.chapters.reduce((n, c) => n + c.topics.length, 0)
  return (
    `<div style="${SECTION_STYLE};padding-top:120px">` +
    `<div style="${LABEL_STYLE}">Subject</div>` +
    `<h1 style="font-size:34px;margin:6px 0 12px">${esc(subject.name)}</h1>` +
    `<div style="width:64px;height:3px;border-radius:2px;background:${esc(subject.color)};margin:0 0 16px"></div>` +
    `<div style="${META_STYLE}">${subject.chapters.length} chapters · ${topicCount} topics · exported from Inkbook</div>` +
    `</div>`
  )
}

// Returns { filename, sections } — each section starts on a fresh PDF page.
export function buildPdfSections(scope, { subject, chapter, topic }) {
  if (scope === 'topic' && topic) {
    return { name: topic.name, sections: [pdfTopicSection(topic)] }
  }
  if (scope === 'chapter' && subject && chapter) {
    return {
      name: chapter.name,
      sections: [pdfChapterTitlePage(subject, chapter), ...chapter.topics.map(pdfTopicSection)],
    }
  }
  if (scope === 'subject' && subject) {
    const sections = [pdfSubjectTitlePage(subject)]
    subject.chapters.forEach((c) => {
      sections.push(pdfChapterTitlePage(subject, c))
      c.topics.forEach((t) => sections.push(pdfTopicSection(t)))
    })
    return { name: subject.name, sections }
  }
  return { name: 'inkbook', sections: [] }
}
