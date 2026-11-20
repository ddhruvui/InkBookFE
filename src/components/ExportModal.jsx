import useNotebookStore, { findSubject, findTopic, subjectTopicCount } from '../store/useNotebookStore'
import { exportScopedPdf } from '../utils/pdf'
import Modal from './ui/Modal'
import Icon from './ui/Icon'

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
  // A topic may sit in a chapter or directly in the subject (ctx.chapterId null).
  const topic = subject && ctx.topicId ? findTopic(subjects, subject._id, ctx.chapterId, ctx.topicId)?.topic || null : null

  const scopes = [
    ...(topic ? [{ id: 'topic', icon: 'file', label: 'This topic', sub: topic.name }] : []),
    ...(chapter
      ? [{ id: 'chapter', icon: 'files', label: 'Whole chapter', sub: `${chapter.name} — ${chapter.topics.length} topics` }]
      : []),
    ...(subject
      ? [
          {
            id: 'subject',
            icon: 'books',
            label: 'Entire subject',
            sub: `${subject.name} — ${subject.chapters.length} chapters · ${subjectTopicCount(subject)} topics`,
          },
        ]
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
    <Modal
      onClose={() => store.closeExport()}
      cardClassName="export-card"
      icon="download"
      title="Export as PDF"
      subtitle="Choose what to include."
    >
      <div className="scope-list" role="radiogroup" aria-label="Export scope">
        {scopes.map((sc) => (
          <button
            type="button"
            role="radio"
            aria-checked={scope === sc.id}
            key={sc.id}
            className={`scope-card ${scope === sc.id ? 'selected' : ''}`}
            onClick={() => store.setExportScope(sc.id)}
          >
            <span className="scope-icon"><Icon name={sc.icon} size={18} /></span>
            <span className="scope-text">
              <span className="scope-label">{sc.label}</span>
              <span className="scope-sub">{sc.sub}</span>
            </span>
            <span className="scope-mark" />
          </button>
        ))}
      </div>
      {done && <div className="export-done"><Icon name="check" size={15} /> {doneMsg}</div>}
      <div className="modal-btn-row">
        <button type="button" className="btn ghost lg" onClick={() => store.closeExport()}>Close</button>
        <button type="button" className="btn secondary lg" onClick={doPrint}><Icon name="printer" size={15} /> Print</button>
        <button type="button" className="btn primary lg" disabled={busy} onClick={doDownload}>
          {busy ? <span className="mini-spin" /> : <Icon name="download" size={15} />} {busy ? 'Generating…' : 'Download PDF'}
        </button>
      </div>
    </Modal>
  )
}
