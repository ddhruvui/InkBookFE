import useNotebookStore, { findSubject, findChapter } from '../../store/useNotebookStore'
import { useNav } from '../../hooks/useNav'

// Inline add form at the bottom of the tree ("NEW CHAPTER IN PHYSICS" etc.).
export default function InlineAddForm() {
  const adding = useNotebookStore((s) => s.adding)
  const addName = useNotebookStore((s) => s.addName)
  const subjects = useNotebookStore((s) => s.subjects)
  const store = useNotebookStore.getState()
  const { goTopic } = useNav()

  if (!adding) return null

  let label = 'NEW SUBJECT'
  if (adding.type === 'chapter') {
    const subject = findSubject(subjects, adding.subjectId)
    label = 'NEW CHAPTER IN ' + (subject ? subject.name.toUpperCase() : '')
  } else if (adding.type === 'topic') {
    const found = findChapter(subjects, adding.subjectId, adding.chapterId)
    label = 'NEW TOPIC IN ' + (found ? found.chapter.name.toUpperCase() : '')
  }

  const confirm = () => {
    const result = store.confirmAdd()
    if (result?.type === 'topic') goTopic(result.subjectId, result.chapterId, result.topicId)
  }

  return (
    <div className="add-form">
      <div className="add-label">{label}</div>
      <input
        autoFocus
        className="add-input"
        placeholder="Name…"
        value={addName}
        onChange={(e) => store.setAddName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') confirm()
          if (e.key === 'Escape') store.cancelAdding()
        }}
      />
      <div className="add-btn-row">
        <button className="add-btn-add" onClick={confirm}>Add</button>
        <button className="add-btn-cancel" onClick={() => store.cancelAdding()}>Cancel</button>
      </div>
    </div>
  )
}
