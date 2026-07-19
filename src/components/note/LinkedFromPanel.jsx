import useNotebookStore, { linkedFrom } from '../../store/useNotebookStore'
import { useNav } from '../../hooks/useNav'

// "🔗 Linked from:" — topics that reference this one via [[name]].
export default function LinkedFromPanel({ topic }) {
  const subjects = useNotebookStore((s) => s.subjects)
  const { goTopic } = useNav()
  const links = linkedFrom(subjects, topic)
  if (!links.length) return null
  return (
    <div className="linked-from no-print">
      <span className="linked-from-label">🔗 Linked from:</span>
      {links.map((l) => (
        <span
          key={l.topic.id}
          className="linked-from-link"
          onClick={() => goTopic(l.subject._id, l.chapter.id, l.topic.id)}
        >
          {l.topic.name}
        </span>
      ))}
    </div>
  )
}
