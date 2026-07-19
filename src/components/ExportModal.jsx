import useNotebookStore, { findSubject } from '../store/useNotebookStore'
import { exportScopedPdf } from '../utils/pdf'
import Modal from './ui/Modal'

// ⇩ Export as PDF — scope cards (topic / chapter / subject), scoped print,
// client-side PDF generation (jspdf + html2canvas).
export default function ExportModal() {
  const exportModal = useNotebookStore((s) => s.exportModal)
  const subjects = useNotebookStore((s) => s.subjects)
  const store = useNotebookStore.getState()

  if (!exportModal) return null
  const { ctx, scope, done, busy } = exportModal

  const subject = findSubject(subjects, ctx.subjectId)
  const chapter = subject && ctx.chapterId ? subject.chapters.find((c) => c.id === ctx.chapterId) : null
  const topic = chapter && ctx.topicId ? chapter.topics.find((t) => t.id === ctx.topicId) : null

  const scopes = [
    ...(topic ? [{ id: 'topic', icon: '📄', label: 'This topic', sub: topic.name }] : []),
    ...(chapter
      ? [{ id: 'chapter', icon: '📑', label: 'Whole chapter', sub: `${chapter.name} — ${chapter.topics.length} topics` }]
      : []),
    ...(subject
      ? [{ id: 'subject', icon: '📚', label: 'Entire subject', sub: `${subject.name} — ${subject.chapters.length} chapters` }]
      : []),
  ]

  const doPrint = () => {
    if (scope === 'topic') {
      store.closeExport()
      setTimeout(() => window.print(), 200)
    } else {
      store.scopedPrint(scope, ctx)
    }
  }

  const doDownload = async () => {
    if (busy) return
    store.setExportState({ busy: true, done: false })
    try {
      await exportScopedPdf(scope, { subject, chapter, topic })
      store.setExportState({ busy: false, done: true })
      store.toast('⇩ PDF generated')
    } catch {
      store.setExportState({ busy: false })
      store.toast('PDF export failed')
    }
  }

  const doneMsg =
    (scope === 'topic' ? 'Topic' : scope === 'chapter' ? 'Chapter' : 'Subject') + ' PDF ready'

  return (
    <Modal onClose={() => store.closeExport()} cardClassName="export-card">
      <div className="modal-title">⇩ Export as PDF</div>
      <div className="modal-sub">Choose what to include.</div>
      <div className="scope-list">
        {scopes.map((sc) => (
          <div
            key={sc.id}
            className={`scope-card ${scope === sc.id ? 'selected' : ''}`}
            onClick={() => store.setExportScope(sc.id)}
          >
            <span className="scope-icon">{sc.icon}</span>
            <div style={{ flex: 1 }}>
              <div className="scope-label">{sc.label}</div>
              <div className="scope-sub">{sc.sub}</div>
            </div>
            <span className="scope-mark">{scope === sc.id ? '●' : ''}</span>
          </div>
        ))}
      </div>
      {done && <div className="export-done">✓ {doneMsg}</div>}
      <div className="modal-btn-row">
        <button className="modal-btn-ghost" onClick={() => store.closeExport()}>Close</button>
        <button className="modal-btn-outline" onClick={doPrint}>⎙ Print</button>
        <button className="modal-btn-primary" disabled={busy} onClick={doDownload}>
          {busy ? 'Generating…' : 'Download PDF'}
        </button>
      </div>
    </Modal>
  )
}
