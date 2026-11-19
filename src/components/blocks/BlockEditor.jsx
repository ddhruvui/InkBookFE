import { useRef, useState } from 'react'
import { EDIT_HINTS, EDIT_PLACEHOLDERS, editRows } from '../../utils/blocks'

// B / I / Highlight / [[link]] — wraps the current textarea selection
// (exact markup from the prototype fmt* handlers).
function FormatToolbar({ onWrap, onList }) {
  return (
    <div className="format-bar">
      <span className="fmt-chip bold" title="Bold selection" onMouseDown={(e) => e.preventDefault()} onClick={() => onWrap('<b>', '</b>')}>
        B
      </span>
      <span className="fmt-chip italic" title="Italicize selection" onMouseDown={(e) => e.preventDefault()} onClick={() => onWrap('<em>', '</em>')}>
        I
      </span>
      <span
        className="fmt-chip hl"
        title="Highlight selection"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onWrap("<span style='background:#f5d98f;padding:0 3px;border-radius:3px'>", '</span>')}
      >
        Highlight
      </span>
      <span className="fmt-chip link" title="Link to another topic" onMouseDown={(e) => e.preventDefault()} onClick={() => onWrap('[[', ']]')}>
        [[link]]
      </span>
      <span className="fmt-chip" title="Turn selected lines into a bulleted list" onMouseDown={(e) => e.preventDefault()} onClick={onList}>
        • List
      </span>
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
      <div className="editor-hint">{EDIT_HINTS[block.type] || 'EDIT'}</div>
      {block.type === 'text' && <FormatToolbar onWrap={wrap} onList={toggleList} />}
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
        <button className="editor-cancel" onClick={onCancel}>Cancel</button>
        <button className="editor-save" onClick={() => onSave(text)}>Save</button>
      </div>
    </div>
  )
}
