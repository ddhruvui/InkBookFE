import { useParams, Navigate } from 'react-router-dom'
import useNotebookStore, { findChapter, chapterMarks, topicSnippet } from '../../store/useNotebookStore'
import { useNav } from '../../hooks/useNav'
import TopBar from '../layout/TopBar'
import Button from '../ui/Button'
import SaveButton from '../ui/SaveButton'
import Icon from '../ui/Icon'
import TopicCard from './TopicCard'
import SummaryPanel from './SummaryPanel'

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`

export default function ChapterPage() {
  const { s, c } = useParams()
  const subjects = useNotebookStore((s2) => s2.subjects)
  const important = useNotebookStore((s2) => s2.important)
  const loaded = useNotebookStore((s2) => s2.loaded)
  const summary = useNotebookStore((s2) => s2.summary)
  const store = useNotebookStore.getState()
  const { goTopic } = useNav()

  if (!loaded) return <div className="nb-scroll" />
  const found = findChapter(subjects, s, c)
  if (!found) return <Navigate to="/" replace />
  const { subject, chapter } = found
  const marks = chapterMarks(subjects, important, subject._id, chapter.id)
  const starsByTopic = marks.reduce((m, mk) => ((m[mk.topicId] = (m[mk.topicId] || 0) + 1), m), {})
  const ctx = { subjectId: subject._id, chapterId: chapter.id }
  const summarizing = !!summary?.loading && summary.chapterId === chapter.id

  return (
    <>
      <TopBar crumbs={[{ label: subject.name, color: subject.color }, { label: chapter.name }]}>
        <Button icon="sparkles" onClick={() => store.summarizeChapter(subject._id, chapter.id)} disabled={summarizing}>
          Summarize
        </Button>
        <Button icon="star" className="star-count" onClick={() => store.openImportant(ctx)} title="Marked important in this chapter">
          {marks.length ? `Important · ${marks.length}` : 'Important'}
        </Button>
        <span className="toolbar-group">
          <Button icon="download" iconOnly onClick={() => store.openExport({ ...ctx, topicId: null }, 'chapter')}>
            Export PDF
          </Button>
          <Button icon="printer" iconOnly onClick={() => store.scopedPrint('chapter', ctx)}>
            Print chapter
          </Button>
        </span>
        <SaveButton />
      </TopBar>
      <div className="nb-scroll">
        <div className="nb-page">
          <header className="page-head" style={{ '--subject': subject.color }}>
            <div className="page-label">
              <span className="label-dot" /> {subject.name} · Chapter
            </div>
            <h1 className="page-h1">{chapter.name}</h1>
            <div className="page-meta">
              {plural(chapter.topics.length, 'topic')}
              {marks.length > 0 && ` · ${marks.length} starred`}
            </div>
          </header>
          <SummaryPanel
            open={!!summary && summary.chapterId === chapter.id}
            loading={!!summary?.loading}
            items={summary?.items || []}
            onClose={() => store.closeSummary()}
          />
          <h2 className="section-h">Topics</h2>
          <div className="topics-list">
            {chapter.topics.map((topic, i) => (
              <TopicCard
                key={topic.id}
                index={i}
                topic={topic}
                snippet={topicSnippet(topic, 160)}
                stars={starsByTopic[topic.id] || 0}
                onOpen={() => goTopic(subject._id, chapter.id, topic.id)}
              />
            ))}
            <button
              type="button"
              className="add-topic-card"
              onClick={() => {
                store.startAdding({ type: 'topic', subjectId: subject._id, chapterId: chapter.id })
                store.setDrawer(true)
              }}
            >
              <Icon name="plus" size={16} /> New topic
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
