// Block-editor helpers (values copied from the prototype script).
import { htmlToEditText } from './richtext'

// Editor header: block-type label + a short how-to hint.
export const EDIT_LABELS = {
  text: 'Paragraph',
  code: 'Code',
  code2: 'Before / after',
  math: 'Math',
  todo: 'To-do',
  table: 'Table',
  image: 'Image caption',
  link: 'Link',
}

export const EDIT_HINTS = {
  text: 'Enter = new line · [[Topic Name]] links a note',
  code: 'Paste or type code',
  code2: 'Before, then --- on its own line, then after',
  math: 'LaTeX, e.g. E = mc^2',
  todo: 'Describe the task',
  table: 'Tab / Enter to move · paste from Excel, Sheets or Markdown',
  image: 'Shown under the image',
  link: 'Label | URL',
}

export const editRows = (type) =>
  type === 'code' || type === 'code2' || type === 'table' || type === 'text' ? 6 : 2

export const isEditable = (type) => type !== 'diagram' && type !== 'scan'

// Initial textarea value when opening the inline editor on an existing block.
export function blockEditText(block) {
  const p = block.payload || {}
  switch (block.type) {
    case 'text':
      return htmlToEditText(p.html || '')
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
// ＋ Add block menu (image inserts an empty dropzone, no editor).
export const INSERT_DEFS = [
  { label: 'Paragraph', kind: 'text', icon: 'paragraph', desc: 'Rich text with links' },
  { label: 'Code', kind: 'code', icon: 'code', desc: 'Snippet with copy' },
  { label: 'Before / after', kind: 'code2', icon: 'diff', desc: 'Compare two versions' },
  { label: 'Math', kind: 'math', icon: 'sigma', desc: 'LaTeX formula' },
  { label: 'To-do', kind: 'todo', icon: 'todo', desc: 'Checkbox task' },
  { label: 'Table', kind: 'table', icon: 'table', desc: 'Grid — paste from Sheets' },
  { label: 'Image', kind: 'image', icon: 'image', desc: 'Upload a picture' },
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
