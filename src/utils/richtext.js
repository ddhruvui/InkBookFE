import DOMPurify from 'dompurify'

// Allowed marks per SPEC decision 6: b, i, em, strong, span[style], mark, a, br
// (+ p so AI scan-converted bodies keep paragraph breaks;
// + data-link so wiki-link spans survive; DOMPurify strips javascript: URIs).
const SANITIZE_OPTS = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'span', 'mark', 'a', 'br', 'p'],
  ALLOWED_ATTR: ['style', 'href', 'target', 'rel', 'data-link', 'title', 'class'],
}

export function sanitizeHtml(html) {
  return DOMPurify.sanitize(String(html ?? ''), SANITIZE_OPTS)
}

export function sanitizeSvg(svg) {
  return DOMPurify.sanitize(String(svg ?? ''), { USE_PROFILES: { svg: true, svgFilters: true } })
}

// [[Topic Name]] → accent + dashed-underline span (exact style from prototype linkify()).
export function linkifyHtml(html) {
  return String(html ?? '').replace(/\[\[([^\]]+)\]\]/g, (_, name) => {
    const attr = name.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
    return `<span data-link="${attr}" style='color:#b8552e;border-bottom:1px dashed #b8552e;cursor:pointer'>${name}</span>`
  })
}

// Wrap query matches (outside tags) in <mark> — exact behavior of prototype decorate().
export function highlightHtml(html, q) {
  const query = String(q ?? '').trim()
  if (!query || query.includes('<')) return html
  const re = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi')
  return String(html)
    .split(/(<[^>]+>)/g)
    .map((part) =>
      part.startsWith('<')
        ? part
        : part.replace(re, "<mark style='background:#f0d9a0;padding:0 2px;border-radius:3px'>$1</mark>")
    )
    .join('')
}

// Underline stored ★ snippets (outside tags) wherever their text still occurs —
// same text-node-walking approach as highlightHtml(), so markup never breaks matching.
export function underlineImportantHtml(html, texts) {
  const snippets = (texts || []).map((t) => String(t ?? '')).filter((t) => t.trim() && !t.includes('<'))
  let out = String(html)
  snippets.forEach((text) => {
    const re = new RegExp('(' + text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'g')
    out = out
      .split(/(<[^>]+>)/g)
      .map((part) =>
        part.startsWith('<')
          ? part
          : part.replace(re, "<span class='imp-underline' title='★ important — click to remove'>$1</span>")
      )
      .join('')
  })
  return out
}

/* ── Line breaks ──
   Paragraph text is stored with plain "\n" newlines (what you type). Older notes
   have hand-typed "<br/>" (often followed by a newline too); both forms render
   the same, and the editor shows either as a plain new line. */

// "<br/>\n" / "<br>" → "\n", and drop stray newlines around <p> tags.
export function normalizeBreaks(html) {
  return String(html ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/<br\s*\/?>[ \t]*\n?/gi, '\n')
    .replace(/\s*\n\s*(<\/?p\b[^>]*>)/gi, '$1')
    .replace(/(<\/?p\b[^>]*>)\s*\n\s*/gi, '$1')
    .replace(/\n+$/, '')
}

// "\n" (outside tags) → <br>, for rendering.
export function breaksToHtml(html) {
  return String(html ?? '')
    .split(/(<[^>]+>)/g)
    .map((part) => (part.startsWith('<') ? part : part.replace(/\n/g, '<br>')))
    .join('')
}

// What the inline editor shows for a stored paragraph: real new lines, no <br/>.
export function htmlToEditText(html) {
  return normalizeBreaks(html)
}

// Full pipeline for text blocks: line breaks + wiki-links + ★ underlines +
// search highlight + sanitize. Breaks become <br> last so ★ snippets and
// search matches that span a line still match the "\n" in the text.
export function decorateHtml(html, hlQ, importantTexts) {
  const base = normalizeBreaks(html)
  return sanitizeHtml(breaksToHtml(highlightHtml(underlineImportantHtml(linkifyHtml(base), importantTexts), hlQ)))
}

// Scan transcripts are plain text: escape, underline ★ snippets, sanitize.
export function decorateScanText(text, importantTexts) {
  const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return sanitizeHtml(underlineImportantHtml(esc(text), (importantTexts || []).map(esc)))
}

export function stripTags(html) {
  return String(html ?? '').replace(/<[^>]+>/g, '')
}
