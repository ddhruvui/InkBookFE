import useNotebookStore, { computeRecents } from '../../store/useNotebookStore'
import { useNav } from '../../hooks/useNav'
import SaveButton from '../ui/SaveButton'
import RecentCard from '../dashboard/RecentCard'

// Dashboard: 💾 Save (no greeting, per design), subtitle, first 4 recent topics.
export default function Dashboard() {
  const subjects = useNotebookStore((s) => s.subjects)
  const loaded = useNotebookStore((s) => s.loaded)
  const store = useNotebookStore.getState()
  const { goTopic } = useNav()
  const recents = computeRecents(subjects).slice(0, 4)

  return (
    <div className="nb-dash">
      <div className="dash-head">
        <span className="nb-burger burger-lg no-print" onClick={() => store.setDrawer(true)}>☰</span>
        <div style={{ flex: 1 }} />
        <SaveButton className="dash" />
      </div>
      <div className="dash-sub">Pick up where you left off, or scan a fresh page of notes.</div>
      <div className="dash-cards">
        {recents.map((r) => (
          <RecentCard
            key={r.topic.id}
            color={r.subject.color}
            title={r.topic.name}
            path={`${r.subject.name} › ${r.chapter.name}`}
            onOpen={() => goTopic(r.subject._id, r.chapter.id, r.topic.id)}
          />
        ))}
      </div>
      {loaded && recents.length === 0 && (
        <div className="dash-empty">No notes yet — create a subject to begin.</div>
      )}
    </div>
  )
}
