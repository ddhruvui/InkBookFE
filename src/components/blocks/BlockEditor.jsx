import { useRef, useState } from 'react'
import { EDIT_HINTS, EDIT_LABELS, EDIT_PLACEHOLDERS, editRows } from '../../utils/blocks'
import Icon from '../ui/Icon'

// B / I / Highlight / [[link]] / list — wraps the current textarea selection
// (exact markup from the prototype fmt* handlers).
function Fmt({ icon, label, onClick, className = '' }) {
  return (
    <button
      type="button"
      className={`fmt-chip ${className}`}
      title={label}
      aria-label={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      <Icon name={icon} size={15} />
    </button>
  )
}

function FormatToolbar({ onWrap, onList }) {
  return (
    <div className="format-bar" role="toolbar" aria-label="Formatting">
      <Fmt icon="bold" label="Bold selection" onClick={() => onWrap('<b>', '</b>')} />
      <Fmt icon="italic" label="Italicize selection" onClick={() => onWrap('<em>', '</em>')} />
      <Fmt
        icon="highlighter"
        label="Highlight selection"
        className="hl"
        onClick={() => onWrap("<span style='background:#f5d98f;padding:0 3px;border-radius:3px'>", '</span>')}
      />
      <span className="fmt-sep" />
      <Fmt icon="wikilink" label="Link to another topic — [[Topic Name]]" onClick={() => onWrap('[[', ']]')} />
      <Fmt icon="list" label="Turn selected lines into a bulleted list" onClick={onList} />
    </div>
  )
}

// Inline block editor: uppercase hint, format toolbar for text blocks,
// mono textarea, Cancel / Save.
export default function BlockEditor({ block, initialText, onSave, onCancel }) {
  const [text, setText] = useState(initialText)
  const taRef = useRef(null)

  const wrap = (pre, post) => {
    const ta = taRef.current
    const start = ta ? ta.selectionStart : text.length
    const end = ta ? ta.selectionEnd : text.length
    const sel = text.slice(start, end) || 'text'
    setText(text.slice(0, start) + pre + sel + post + text.slice(end))
  }

  // Prefix every selected line (or the current line) with "• "; toggles off
  // when all of them already have it.
  const toggleList = () => {
    const ta = taRef.current
    const start = ta ? ta.selectionStart : text.length
    const end = ta ? ta.selectionEnd : text.length
    const from = text.lastIndexOf('\n', start - 1) + 1
    const toIdx = text.indexOf('\n', end)
    const to = toIdx === -1 ? text.length : toIdx
    const lines = text.slice(from, to).split('\n')
    const allBulleted = lines.every((l) => /^\s*[•●\-*]\s/.test(l) || !l.trim())
    const next = lines
      .map((l) => (!l.trim() ? l : allBulleted ? l.replace(/^\s*[•●\-*]\s+/, '') : '• ' + l.replace(/^\s*[●\-*]\s+/, '')))
      .join('\n')
    setText(text.slice(0, from) + next + text.slice(to))
  }

  const onKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      onSave(text)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      onCancel()
    }
  }

  return (
    <div className="block-editor">
      <div className="editor-head">
        <span className="editor-label">{EDIT_LABELS[block.type] || 'Edit'}</span>
        <span className="editor-hint">{EDIT_HINTS[block.type] || ''}</span>
        <span style={{ flex: 1 }} />
        {block.type === 'text' && <FormatToolbar onWrap={wrap} onList={toggleList} />}
      </div>
      <textarea
        ref={taRef}
        className="editor-textarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={EDIT_PLACEHOLDERS[block.type] || ''}
        rows={editRows(block.type)}
        onKeyDown={onKeyDown}
        autoFocus
      />
      <div className="editor-btn-row">
        <span className="editor-kbd-hint">⌘Enter save · Esc cancel</span>
        <span style={{ flex: 1 }} />
        <button type="button" className="mini-btn ghost" onClick={onCancel}>Cancel</button>
        <button type="button" className="mini-btn primary" onClick={() => onSave(text)}>Save</button>
      </div>
    </div>
  )
}
