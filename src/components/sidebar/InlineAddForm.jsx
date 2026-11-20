import useNotebookStore, { findSubject, findChapter } from '../../store/useNotebookStore'
import { useNav } from '../../hooks/useNav'

// Inline add form at the bottom of the tree ("New chapter in Physics" etc.).
export default function InlineAddForm() {
  const adding = useNotebookStore((s) => s.adding)
  const addName = useNotebookStore((s) => s.addName)
  const subjects = useNotebookStore((s) => s.subjects)
  const store = useNotebookStore.getState()
  const { goTopic } = useNav()

  if (!adding) return null

  let label = 'New subject'
  if (adding.type === 'chapter') {
    const subject = findSubject(subjects, adding.subjectId)
    label = 'New chapter in ' + (subject ? subject.name : '')
  } else if (adding.type === 'topic') {
    // No chapterId → the topic goes directly in the subject.
    const found = adding.chapterId ? findChapter(subjects, adding.subjectId, adding.chapterId) : null
    const subject = found ? null : findSubject(subjects, adding.subjectId)
    label = 'New topic in ' + (found ? found.chapter.name : subject ? subject.name : '')
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
        aria-label={label}
        placeholder="Name…"
        value={addName}
        onChange={(e) => store.setAddName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') confirm()
          if (e.key === 'Escape') store.cancelAdding()
        }}
      />
      <div className="add-btn-row">
        <button type="button" className="mini-btn ghost" onClick={() => store.cancelAdding()}>Cancel</button>
        <button type="button" className="mini-btn primary" onClick={confirm}>Add</button>
      </div>
    </div>
  )
}
