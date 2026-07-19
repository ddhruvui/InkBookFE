import useNotebookStore from '../../store/useNotebookStore'
import Button from './Button'

// Green 💾 Save with dirty / saving / saved state.
export default function SaveButton({ className = '' }) {
  const saveStatus = useNotebookStore((s) => s.saveStatus)
  const dirty = useNotebookStore((s) => s.dirty)
  const save = useNotebookStore((s) => s.save)
  const label =
    saveStatus === 'saving' ? '💾 Saving…' : saveStatus === 'saved' && !dirty ? '✓ Saved' : '💾 Save'
  return (
    <Button variant="save" className={`no-print ${className}`} onClick={save}>
      {label}
    </Button>
  )
}
