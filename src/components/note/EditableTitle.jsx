import { useState } from 'react'
import useNotebookStore from '../../store/useNotebookStore'
import Icon from '../ui/Icon'

// Large serif title; ✎ or double-click renames inline
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
        aria-label="Topic title"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onFocus={(e) => e.target.select()}
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
      <h1 className="note-title" onDoubleClick={start} title="Double-click to rename">{topic.name}</h1>
      <button type="button" className="icon-btn note-title-edit-btn no-print" title="Rename" aria-label="Rename topic" onClick={start}>
        <Icon name="pencil" size={15} />
      </button>
    </div>
  )
}
