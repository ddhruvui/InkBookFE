import useNotebookStore, { findChapter, chapterMarks } from '../../store/useNotebookStore'
import { useNav } from '../../hooks/useNav'
import Modal from '../ui/Modal'

// ⭐ Everything starred across this chapter's topics.
export default function ImportantModal() {
  const importantOpen = useNotebookStore((s) => s.importantOpen)
  const subjects = useNotebookStore((s) => s.subjects)
  const important = useNotebookStore((s) => s.important)
  const store = useNotebookStore.getState()
  const { goTopic } = useNav()

  if (!importantOpen) return null
  const found = findChapter(subjects, importantOpen.subjectId, importantOpen.chapterId)
  if (!found) return null
  const { subject, chapter } = found
  const marks = chapterMarks(subjects, important, subject._id, chapter.id)

  return (
    <Modal onClose={() => store.closeImportant()} overlayClassName="imp-overlay" cardClassName="imp-card">
      <div className="imp-head">
        <div className="imp-title">⭐ Important in {subject.name} › {chapter.name}</div>
        <span className="imp-close" onClick={() => store.closeImportant()}>✕</span>
      </div>
      <div className="imp-sub">Everything you starred across this chapter's topics.</div>
      <div className="imp-list">
        {marks.map((mark) => (
          <div
            key={mark.id}
            className="imp-item"
            onClick={() => {
              store.closeImportant()
              goTopic(subject._id, chapter.id, mark.topic.id)
            }}
          >
            <span className="imp-star">★</span>
            <div style={{ flex: 1 }}>
              <div className="imp-text">
                <span className="imp-snippet">{mark.text}</span>
              </div>
              <div className="imp-path">{mark.topic.name}</div>
            </div>
          </div>
        ))}
        {marks.length === 0 && (
          <div className="imp-empty">Nothing starred in this chapter yet — select text in a note and hit ★.</div>
        )}
      </div>
    </Modal>
  )
}
