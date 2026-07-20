import { useMemo } from 'react'
import useNotebookStore from '../../store/useNotebookStore'
import { decorateScanText } from '../../utils/richtext'

// Original-scan attachment card: 📎 label + italic transcript at -0.4° rotation,
// with ★ important underlines. Sanitized before dangerouslySetInnerHTML.
export default function ScanBlock({ block, topicId }) {
  const important = useNotebookStore((s) => s.important)
  const html = useMemo(
    () =>
      decorateScanText(
        block.payload.transcript,
        important.filter((m) => m.topicId === topicId).map((m) => m.text)
      ),
    [block.payload.transcript, important, topicId]
  )
  return (
    <div className="scan-block">
      <div className="scan-label">📎 ORIGINAL SCAN</div>
      {block.payload.imageUrl && (
        <img className="scan-image" src={block.payload.imageUrl} alt="Original scan" />
      )}
      <div
        className="scan-text"
        onClick={(e) => {
          const imp = e.target.closest && e.target.closest('.imp-underline')
          if (imp) useNotebookStore.getState().removeImportantByText(topicId, imp.textContent)
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
