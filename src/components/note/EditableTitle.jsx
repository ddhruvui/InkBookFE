import { useState } from 'react'
import useNotebookStore from '../../store/useNotebookStore'

// Lora 30px/600 title with accent underline; ✎ or double-click renames inline
// (Enter/blur saves, Esc cancels).
export default function EditableTitle({ topic }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState('')
  const store = useNotebookStore.getState()

  const start = () => {
    setVal(topic.name)
    setEditing(true)
  }
  const save = () => {
    if (val.trim()) store.renameTopicTitle(topic.id, val)
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        autoFocus
        className="note-title-input"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') save()
          if (e.key === 'Escape') setEditing(false)
        }}
        onBlur={save}
      />
    )
  }

  return (
    <div className="note-title-row">
      <div className="note-title" onDoubleClick={start}>{topic.name}</div>
      <span className="note-title-edit-btn no-print" title="Rename" onClick={start}>✎</span>
    </div>
  )
}
