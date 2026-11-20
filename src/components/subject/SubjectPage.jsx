import { useParams, Navigate } from 'react-router-dom'
import useNotebookStore, { findSubject, topicSnippet, subjectTopicCount } from '../../store/useNotebookStore'
import { useNav } from '../../hooks/useNav'
import TopBar from '../layout/TopBar'
import Button from '../ui/Button'
import SaveButton from '../ui/SaveButton'
import Icon from '../ui/Icon'
import TopicCard from '../chapter/TopicCard'

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`

// Subject overview: its chapters, then the topics that sit directly in the
// subject (no chapter). Both lists end with a dashed "New …" card that opens
// the sidebar add form.
export default function SubjectPage() {
  const { s } = useParams()
  const subjects = useNotebookStore((s2) => s2.subjects)
  const important = useNotebookStore((s2) => s2.important)
  const loaded = useNotebookStore((s2) => s2.loaded)
  const store = useNotebookStore.getState()
  const { goChapter, goTopic } = useNav()

  if (!loaded) return <div className="nb-scroll" />
  const subject = findSubject(subjects, s)
  if (!subject) return <Navigate to="/" replace />
  const topics = subject.topics || []
  const topicIds = new Set(topics.map((t) => t.id))
  const starsByTopic = important.reduce(
    (m, mk) => (topicIds.has(mk.topicId) ? ((m[mk.topicId] = (m[mk.topicId] || 0) + 1), m) : m),
    {}
  )
  const ctx = { subjectId: subject._id, chapterId: null }

  const startAdd = (type) => {
    store.startAdding({ type, subjectId: subject._id, chapterId: null })
    store.setDrawer(true)
  }

  return (
    <>
      <TopBar crumbs={[{ label: subject.name, color: subject.color }]}>
        <Button variant="primary" icon="camera" className="hide-mobile" title="Scan handwritten notes into this subject" onClick={() => store.openScan(ctx)}>
          Scan
        </Button>
        <span className="toolbar-group">
          <Button icon="download" iconOnly onClick={() => store.openExport({ ...ctx, topicId: null }, 'subject')}>
            Export PDF
          </Button>
          <Button icon="printer" iconOnly onClick={() => store.scopedPrint('subject', ctx)}>
            Print subject
          </Button>
        </span>
        <SaveButton />
      </TopBar>
      <div className="nb-scroll">
        <div className="nb-page" style={{ '--subject': subject.color }}>
          <header className="page-head">
            <div className="page-label">
              <span className="label-dot" /> Subject
            </div>
            <h1 className="page-h1">{subject.name}</h1>
            <div className="page-meta">
              {plural(subject.chapters.length, 'chapter')} · {plural(subjectTopicCount(subject), 'topic')}
            </div>
          </header>

          <section className="subject-section">
            <h2 className="section-h">Chapters</h2>
            <div className="topics-list">
              {subject.chapters.map((chapter, i) => (
                <button
                  type="button"
                  key={chapter.id}
                  className="topic-card"
                  style={{ animationDelay: `${i * 35}ms` }}
                  onClick={() => goChapter(subject._id, chapter.id)}
                >
                  <Icon name="folder" size={16} className="topic-card-icon" />
                  <span className="topic-card-body">
                    <span className="topic-card-name">{chapter.name}</span>
                    <span className="topic-card-meta">{plural(chapter.topics.length, 'topic')}</span>
                  </span>
                  <Icon name="arrowRight" size={16} className="topic-card-arrow" />
                </button>
              ))}
              <button type="button" className="add-topic-card" onClick={() => startAdd('chapter')}>
                <Icon name="plus" size={16} /> New chapter
              </button>
            </div>
          </section>

          <section className="subject-section">
            <h2 className="section-h">Topics</h2>
            <div className="topics-list">
              {topics.map((topic, i) => (
                <TopicCard
                  key={topic.id}
                  index={i}
                  topic={topic}
                  snippet={topicSnippet(topic, 160)}
                  stars={starsByTopic[topic.id] || 0}
                  onOpen={() => goTopic(subject._id, null, topic.id)}
                />
              ))}
              <button type="button" className="add-topic-card" onClick={() => startAdd('topic')}>
                <Icon name="plus" size={16} /> New topic
              </button>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
