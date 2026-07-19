import useNotebookStore from '../../store/useNotebookStore'

// 🔍 Highlighting "query" ✕ — shown after opening a search result.
export default function HighlightChip() {
  const hlQ = useNotebookStore((s) => s.hlQ)
  const setHlQ = useNotebookStore((s) => s.setHlQ)
  if (!hlQ) return null
  return (
    <div className="hl-chip no-print">
      🔍 Highlighting "{hlQ}"
      <span className="hl-chip-x" onClick={() => setHlQ('')}>✕</span>
    </div>
  )
}
