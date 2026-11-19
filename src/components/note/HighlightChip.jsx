import useNotebookStore from '../../store/useNotebookStore'
import Icon from '../ui/Icon'

// Highlighting "query" ✕ — shown after opening a search result.
export default function HighlightChip() {
  const hlQ = useNotebookStore((s) => s.hlQ)
  const setHlQ = useNotebookStore((s) => s.setHlQ)
  if (!hlQ) return null
  return (
    <div className="hl-chip no-print">
      <Icon name="search" size={13} />
      Highlighting “{hlQ}”
      <button type="button" className="hl-chip-x" aria-label="Clear highlight" onClick={() => setHlQ('')}>
        <Icon name="x" size={13} />
      </button>
    </div>
  )
}
