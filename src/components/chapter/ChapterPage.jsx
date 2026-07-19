import { useParams, Navigate } from 'react-router-dom'
import useNotebookStore, { findChapter } from '../../store/useNotebookStore'
import { useNav } from '../../hooks/useNav'
import Button from '../ui/Button'
import TopicCard from './TopicCard'
import SummaryPanel from './SummaryPanel'

export default function ChapterPage() {
  const { s, c } = useParams()
  const subjects = useNotebookStore((s2) => s2.subjects)
  const loaded = useNotebookStore((s2) => s2.loaded)
  const summary = useNotebookStore((s2) => s2.summary)
  const store = useNotebookStore.getState()
  const { goTopic } = useNav()

  if (!loaded) return <div className="nb-scroll" />
  const found = findChapter(subjects, s, c)
  if (!found) return <Navigate to="/" replace />
  const { subject, chapter } = found

  return (
    <>
      <div className="nb-toolbar no-print">
        <span className="nb-burger burger-sm" onClick={() => store.setDrawer(true)}>☰</span>
        <div className="crumb">{subject.name} › {chapter.name}</div>
        <Button onClick={() => store.summarizeChapter(subject._id, chapter.id)}>✦ Summarize</Button>
        <Button onClick={() => store.openImportant({ subjectId: subject._id, chapterId: chapter.id })}>
          ★ Important
        </Button>
        <Button
          onClick={() =>
            store.openExport({ subjectId: subject._id, chapterId: chapter.id, topicId: null }, 'chapter')
          }
        >
          ⇩ Export
        </Button>
        <Button onClick={() => store.scopedPrint('chapter', { subjectId: subject._id, chapterId: chapter.id })}>
          ⎙ Print
        </Button>
      </div>
      <div className="nb-scroll">
        <div className="nb-page">
          <div className="page-label">Chapter</div>
          <h1 className="page-h1">{chapter.name}</h1>
          <div style={{ marginBottom: 20 }} />
          <SummaryPanel
            open={!!summary && summary.chapterId === chapter.id}
            loading={!!summary?.loading}
            items={summary?.items || []}
            onClose={() => store.closeSummary()}
          />
          <div className="topics-head">Topics</div>
          <div className="topics-list">
            {chapter.topics.map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                onOpen={() => goTopic(subject._id, chapter.id, topic.id)}
              />
            ))}
            {chapter.topics.length === 0 && (
              <div className="chap-empty">No topics yet — add one from the sidebar.</div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
