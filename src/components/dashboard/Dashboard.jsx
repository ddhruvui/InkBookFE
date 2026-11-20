import useNotebookStore, { computeRecents, topicSnippet, topicPathLabel, subjectTopicCount } from '../../store/useNotebookStore'
import { useNav } from '../../hooks/useNav'
import TopBar from '../layout/TopBar'
import SaveButton from '../ui/SaveButton'
import Icon from '../ui/Icon'
import Kbd from '../ui/Kbd'
import RecentCard from './RecentCard'

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`

// Home: quick actions, the 4 most recent topics, and every subject at a glance.
// (No greeting line and no important-marks section — removed by design.)
export default function Dashboard() {
  const subjects = useNotebookStore((s) => s.subjects)
  const loaded = useNotebookStore((s) => s.loaded)
  const store = useNotebookStore.getState()
  const { goTopic, goChapter, goSubject } = useNav()
  const recents = computeRecents(subjects).slice(0, 4)
  const chapterCount = subjects.reduce((n, s) => n + s.chapters.length, 0)
  const topicCount = subjects.reduce((n, s) => n + subjectTopicCount(s), 0)

  const newSubject = () => {
    store.startAdding({ type: 'subject' })
    store.setDrawer(true)
  }

  return (
    <>
      <TopBar crumbs={[{ label: 'Home' }]}>
        <SaveButton />
      </TopBar>
      <div className="nb-scroll">
        <div className="nb-page wide nb-dash">
          <header className="dash-hero">
            <div className="page-label">Your notebook</div>
            <h1 className="page-h1">Pick up where you left off</h1>
            <div className="dash-sub">
              {loaded && subjects.length > 0
                ? `${plural(subjects.length, 'subject')} · ${plural(chapterCount, 'chapter')} · ${plural(topicCount, 'topic')}`
                : 'Or scan a fresh page of notes.'}
            </div>
            <div className="dash-actions">
              <button type="button" className="quick-action" onClick={() => store.openPalette()}>
                <Icon name="search" size={17} />
                <span>Search notes</span>
                <Kbd>⌘K</Kbd>
              </button>
              <button type="button" className="quick-action accent" onClick={() => store.openScan({})}>
                <Icon name="camera" size={17} />
                <span>Scan a page</span>
              </button>
              <button type="button" className="quick-action" onClick={newSubject}>
                <Icon name="plus" size={17} />
                <span>New subject</span>
              </button>
            </div>
          </header>

          {recents.length > 0 && (
            <section className="dash-section">
              <h2 className="section-h">Recent</h2>
              <div className="dash-cards">
                {recents.map((r, i) => (
                  <RecentCard
                    key={r.topic.id}
                    index={i}
                    color={r.subject.color}
                    title={r.topic.name}
                    path={topicPathLabel(r)}
                    snippet={topicSnippet(r.topic)}
                    onOpen={() => goTopic(r.subject._id, r.chapter ? r.chapter.id : null, r.topic.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {subjects.length > 0 && (
            <section className="dash-section">
              <h2 className="section-h">Subjects</h2>
              <div className="subject-grid">
                {subjects.map((s) => {
                  const looseTopics = s.topics || []
                  return (
                    <div key={s._id} className="subject-card" style={{ '--subject': s.color }}>
                      <div className="subject-card-head">
                        <span className="subject-card-dot" />
                        <button type="button" className="subject-card-name link" onClick={() => goSubject(s._id)}>
                          {s.name}
                        </button>
                      </div>
                      <div className="subject-card-meta">
                        {plural(s.chapters.length, 'chapter')} · {plural(subjectTopicCount(s), 'topic')}
                      </div>
                      <div className="subject-card-chapters">
                        {s.chapters.map((c) => (
                          <button type="button" key={c.id} className="chapter-chip" onClick={() => goChapter(s._id, c.id)}>
                            {c.name}
                            <span className="chapter-chip-count">{c.topics.length}</span>
                          </button>
                        ))}
                        {looseTopics.map((t) => (
                          <button type="button" key={t.id} className="chapter-chip topic-chip" onClick={() => goTopic(s._id, null, t.id)}>
                            <Icon name="file" size={12} />
                            {t.name}
                          </button>
                        ))}
                        {s.chapters.length === 0 && looseTopics.length === 0 && (
                          <span className="subject-card-empty">No chapters or topics yet</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {loaded && recents.length === 0 && subjects.length === 0 && (
            <div className="empty-state">
              <Icon name="book" size={28} />
              <div className="empty-title">No notes yet</div>
              <div className="empty-sub">Create a subject to begin, or scan a handwritten page.</div>
              <button type="button" className="btn primary" onClick={newSubject}>
                <Icon name="plus" size={15} /> New subject
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
