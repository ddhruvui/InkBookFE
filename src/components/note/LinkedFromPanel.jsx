import useNotebookStore, { linkedFrom } from '../../store/useNotebookStore'
import { useNav } from '../../hooks/useNav'
import Icon from '../ui/Icon'

// Backlinks — topics that reference this one via [[name]].
export default function LinkedFromPanel({ topic }) {
  const subjects = useNotebookStore((s) => s.subjects)
  const { goTopic } = useNav()
  const links = linkedFrom(subjects, topic)
  if (!links.length) return null
  return (
    <section className="linked-from no-print">
      <div className="linked-from-label">
        <Icon name="link" size={14} /> Linked from
      </div>
      <div className="linked-from-list">
        {links.map((l) => (
          <button
            type="button"
            key={l.topic.id}
            className="linked-from-link"
            style={{ '--subject': l.subject.color }}
            onClick={() => goTopic(l.subject._id, l.chapter.id, l.topic.id)}
          >
            <span className="label-dot" />
            {l.topic.name}
            <span className="linked-from-path">{l.chapter.name}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
