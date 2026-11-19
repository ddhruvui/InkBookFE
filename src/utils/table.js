// Table helpers shared by the grid editor, the composer's paste detection and
// the table view. Table payload stays `{ rows: string[][] }` (first row = header).
// Mirrored in mobile/src/utils/table.js — keep the two in sync.

const norm = (s) => String(s ?? '').replace(/\r\n?/g, '\n')

// Delimiter-separated parser with spreadsheet-style quoting ("a ""b""", multi-line
// cells), which is what Excel / Google Sheets / Numbers put on the clipboard.
function parseDelimited(text, delim) {
  const rows = []
  let row = []
  let cell = ''
  let quoted = false
  let atCellStart = true
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"'
          i++
        } else quoted = false
      } else cell += ch
      continue
    }
    if (ch === '"' && atCellStart) {
      quoted = true
      atCellStart = false
      continue
    }
    if (ch === delim) {
      row.push(cell)
      cell = ''
      atCellStart = true
      continue
    }
    if (ch === '\n') {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
      atCellStart = true
      continue
    }
    cell += ch
    atCellStart = false
  }
  if (cell !== '' || row.length) {
    row.push(cell)
    rows.push(row)
  }
  return rows
}

const isMdSeparator = (line) => /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/.test(line)

function parseMarkdown(lines) {
  return lines
    .filter((l) => !isMdSeparator(l))
    .map((l) => {
      let s = l.trim()
      if (s.startsWith('|')) s = s.slice(1)
      if (s.endsWith('|') && !s.endsWith('\\|')) s = s.slice(0, -1)
      // eslint-disable-next-line no-control-regex
      return s.replace(/\\\|/g, '\u0000').split('|').map((c) => c.replace(/\u0000/g, '|'))
    })
}

// Pads every row to the widest one, trims cells, and drops rows / columns that
// are entirely empty. Returns [] when nothing is left.
export function cleanRows(rows) {
  let out = (rows || []).map((r) => (Array.isArray(r) ? r : [r]).map((c) => String(c ?? '').trim()))
  out = out.filter((r) => r.some((c) => c !== ''))
  if (!out.length) return []
  const width = Math.max(...out.map((r) => r.length))
  out = out.map((r) => (r.length < width ? [...r, ...Array(width - r.length).fill('')] : r))
  const keep = []
  for (let c = 0; c < width; c++) if (out.some((r) => r[c] !== '')) keep.push(c)
  return out.map((r) => keep.map((c) => r[c]))
}

// Best-effort parse of pasted / typed text into rows. Detects, in order:
// tab-separated (spreadsheets), Markdown tables, pipe-separated ("a | b", the
// legacy InkBook format), and CSV. Returns null when the text isn't tabular.
export function parseTableText(input) {
  const text = norm(input).replace(/^\n+|\n+$/g, '')
  if (!text.trim()) return null
  const lines = text.split('\n').filter((l) => l.trim())

  if (text.includes('\t')) {
    const rows = cleanRows(parseDelimited(text, '\t'))
    if (rows.length && rows[0].length > 1) return rows
  }
  if (lines.some((l) => l.includes('|'))) {
    const md = lines.some(isMdSeparator)
    const pipeLines = lines.filter((l) => l.includes('|') || isMdSeparator(l))
    if (md || pipeLines.length === lines.length) {
      const rows = cleanRows(parseMarkdown(pipeLines))
      if (rows.length && rows[0].length > 1) return rows
    }
  }
  if (lines.length >= 2 && text.includes(',')) {
    const rows = parseDelimited(text, ',')
    const widths = new Set(rows.filter((r) => r.some((c) => c.trim())).map((r) => r.length))
    if (widths.size === 1 && [...widths][0] > 1) return cleanRows(rows)
  }
  return null
}

// Paste detection for the composer: only multi-line tabular text, or a single
// tab-separated line (a copied spreadsheet row), counts as a table.
export function looksLikeTable(text) {
  const t = norm(text).trim()
  if (!t) return false
  const multiLine = t.includes('\n')
  if (!multiLine && !t.includes('\t')) return false
  // Comma-only text is usually prose — only treat it as CSV when it's clearly a
  // grid (3+ lines, 3+ columns).
  if (!t.includes('\t') && !t.includes('|')) {
    const lines = t.split('\n').filter((l) => l.trim())
    if (lines.length < 3 || lines.some((l) => (l.match(/,/g) || []).length < 2)) return false
  }
  const rows = parseTableText(t)
  return !!rows && rows[0].length > 1 && (rows.length > 1 || t.includes('\t'))
}

// HTML clipboard (copied from a web page, Google Docs, Word, Notion…) → rows.
// Uses the browser DOMParser; returns null when there is no <table>.
export function parseHtmlTable(html) {
  if (!html || !/<table[\s>]/i.test(html) || typeof DOMParser === 'undefined') return null
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const table = doc.querySelector('table')
  if (!table) return null
  const rows = [...table.querySelectorAll('tr')].map((tr) =>
    [...tr.children]
      .filter((td) => /^(TD|TH)$/.test(td.tagName))
      .flatMap((td) => {
        td.querySelectorAll('br').forEach((br) => br.replaceWith('\n'))
        const text = td.textContent.replace(/[ \t ]+/g, ' ').replace(/ *\n */g, '\n').trim()
        const span = Math.min(Number(td.getAttribute('colspan')) || 1, 20)
        return [text, ...Array(span - 1).fill('')]
      })
  )
  const out = cleanRows(rows)
  return out.length ? out : null
}

// Tab-separated text — pastes straight into Excel / Sheets / Numbers cells.
export function rowsToTsv(rows) {
  const q = (c) => (/[\t\n"]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c)
  return (rows || []).map((r) => r.map((c) => q(String(c ?? ''))).join('\t')).join('\n')
}

export function rowsToMarkdown(rows) {
  if (!rows || !rows.length) return ''
  const esc = (c) => String(c ?? '').replace(/\|/g, '\\|').replace(/\n/g, '<br>')
  const line = (r) => '| ' + r.map(esc).join(' | ') + ' |'
  return [line(rows[0]), '| ' + rows[0].map(() => '---').join(' | ') + ' |', ...rows.slice(1).map(line)].join('\n')
}

export const emptyGrid = (rows = 3, cols = 2) =>
  Array.from({ length: rows }, () => Array(cols).fill(''))
