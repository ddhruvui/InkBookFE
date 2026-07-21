// Block-editor helpers (values copied from the prototype script).

export const EDIT_HINTS = {
  text: 'EDIT PARAGRAPH — HTML + [[LINKS]] ALLOWED',
  code: 'EDIT CODE',
  code2: 'EDIT — BEFORE, THEN --- ON ITS OWN LINE, THEN AFTER',
  math: 'EDIT FORMULA',
  todo: 'EDIT TASK',
  table: 'EDIT TABLE — ONE ROW PER LINE, CELLS SEPARATED BY |',
  image: 'EDIT CAPTION',
  link: 'EDIT — LABEL | URL',
}

export const editRows = (type) =>
  type === 'code' || type === 'code2' || type === 'table' || type === 'text' ? 6 : 2

export const isEditable = (type) => type !== 'diagram' && type !== 'scan'

// Initial textarea value when opening the inline editor on an existing block.
export function blockEditText(block) {
  const p = block.payload || {}
  switch (block.type) {
    case 'text':
      return p.html || ''
    case 'code2':
      return (p.before || '') + '\n---\n' + (p.after || '')
    case 'table':
      return (p.rows || []).map((r) => r.join(' | ')).join('\n')
    case 'image':
      return p.caption || ''
    case 'link':
      return (p.text || '') + ' | ' + (p.url || '')
    default:
      return p.text || ''
  }
}

// ＋ Add block chip menu (image inserts an empty dropzone, no editor).
export const INSERT_DEFS = [
  { label: '¶ Paragraph', kind: 'text' },
  { label: '{ } Code', kind: 'code' },
  { label: '⇄ Before / after', kind: 'code2' },
  { label: '∑ Math', kind: 'math' },
  { label: '☑ To-do', kind: 'todo' },
  { label: '▦ Table', kind: 'table' },
  { label: '🖼 Image', kind: 'image' },
]

// Greyed format hint shown in an empty editor — never inserted as real text.
export const EDIT_PLACEHOLDERS = {
  text: 'Write a paragraph…',
  code: '# code',
  code2: 'before\n---\nafter',
  math: 'y = …',
  todo: 'New task',
  table: 'Col 1 | Col 2\n… | …',
  image: 'Caption',
  link: 'Label | https://…',
}
