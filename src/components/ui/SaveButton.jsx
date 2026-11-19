import useNotebookStore from '../../store/useNotebookStore'
import Icon from './Icon'

// Autosave status pill — replaces the old green 💾 Save button. It always
// reflects the real state (Unsaved / Saving… / Saved) and clicking it still
// flushes immediately (same as ⌘S).
export default function SaveButton({ className = '' }) {
  const saveStatus = useNotebookStore((s) => s.saveStatus)
  const dirty = useNotebookStore((s) => s.dirty)
  const save = useNotebookStore((s) => s.save)
  const state = saveStatus === 'saving' ? 'saving' : dirty ? 'dirty' : 'saved'
  const label = state === 'saving' ? 'Saving…' : state === 'dirty' ? 'Unsaved' : 'Saved'
  return (
    <button
      type="button"
      className={`save-pill ${state} no-print ${className}`}
      onClick={save}
      title={state === 'dirty' ? 'Save now (⌘S) — changes also autosave' : 'All changes saved · ⌘S saves now'}
      aria-label={`${label} — save now`}
      data-state={state}
    >
      {state === 'saving' ? <span className="mini-spin" /> : <Icon name={state === 'dirty' ? 'cloud' : 'cloudCheck'} size={15} />}
      <span className="save-pill-label">{label}</span>
    </button>
  )
}
