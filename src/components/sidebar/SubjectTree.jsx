import useNotebookStore from '../../store/useNotebookStore'
import { useNav, useCurrentRef } from '../../hooks/useNav'
import NodeContextMenu from './NodeContextMenu'
import InlineAddForm from './InlineAddForm'

function menuMatches(menu, type, ids) {
  return (
    !!menu &&
    menu.type === type &&
    menu.subjectId === (ids.subjectId ?? null) &&
    menu.chapterId === (ids.chapterId ?? null) &&
    menu.topicId === (ids.topicId ?? null)
  )
}

function TopicRow({ subject, chapter, topic }) {
  const menu = useNotebookStore((s) => s.menu)
  const store = useNotebookStore.getState()
  const { goTopic } = useNav()
  const current = useCurrentRef()
  const ids = { subjectId: subject._id, chapterId: chapter.id, topicId: topic.id }
  const active = current.topicId === topic.id
  return (
    <div>
      <div className={`topic-row ${active ? 'active' : ''}`} onClick={() => goTopic(subject._id, chapter.id, topic.id)}>
        <span className="topic-name">{topic.name}</span>
        <span
          className="row-action sm"
          title="Manage"
          onClick={(e) => {
            e.stopPropagation()
            store.toggleMenu({ type: 'topic', ...ids })
          }}
        >
          ⋯
        </span>
      </div>
      {menuMatches(menu, 'topic', ids) && <NodeContextMenu type="topic" ids={ids} name={topic.name} />}
    </div>
  )
}

function ChapterRow({ subject, chapter }) {
  const menu = useNotebookStore((s) => s.menu)
  const open = useNotebookStore((s) => !!s.openChapters[chapter.id])
  const store = useNotebookStore.getState()
  const { goChapter } = useNav()
  const ids = { subjectId: subject._id, chapterId: chapter.id, topicId: null }
  return (
    <div>
      <div className="chapter-row" onClick={() => goChapter(subject._id, chapter.id)}>
        <span
          className="chapter-chev"
          onClick={(e) => {
            e.stopPropagation()
            store.toggleChapterOpen(chapter.id)
          }}
        >
          {open ? '▾' : '▸'}
        </span>
        <span className="chapter-name">{chapter.name}</span>
        <span
          className="row-action sm"
          title="Add topic"
          onClick={(e) => {
            e.stopPropagation()
            store.startAdding({ type: 'topic', subjectId: subject._id, chapterId: chapter.id })
          }}
        >
          ＋
        </span>
        <span
          className="row-action sm"
          title="Manage"
          onClick={(e) => {
            e.stopPropagation()
            store.toggleMenu({ type: 'chapter', ...ids })
          }}
        >
          ⋯
        </span>
      </div>
      {menuMatches(menu, 'chapter', ids) && <NodeContextMenu type="chapter" ids={ids} name={chapter.name} />}
      {open &&
        chapter.topics.map((topic) => (
          <TopicRow key={topic.id} subject={subject} chapter={chapter} topic={topic} />
        ))}
    </div>
  )
}

function SubjectRow({ subject }) {
  const menu = useNotebookStore((s) => s.menu)
  const open = useNotebookStore((s) => !!s.openSubjects[subject._id])
  const store = useNotebookStore.getState()
  const ids = { subjectId: subject._id, chapterId: null, topicId: null }
  return (
    <div>
      <div className="subject-row" onClick={() => store.toggleSubjectOpen(subject._id)}>
        <span className="subject-chev" style={{ color: subject.color }}>{open ? '▾' : '▸'}</span>
        <span className="subject-dot" style={{ background: subject.color }} />
        <span className="subject-name">{subject.name}</span>
        <span
          className="row-action"
          title="Add chapter"
          onClick={(e) => {
            e.stopPropagation()
            store.startAdding({ type: 'chapter', subjectId: subject._id })
          }}
        >
          ＋
        </span>
        <span
          className="row-action"
          title="Manage"
          onClick={(e) => {
            e.stopPropagation()
            store.toggleMenu({ type: 'subject', ...ids })
          }}
        >
          ⋯
        </span>
      </div>
      {menuMatches(menu, 'subject', ids) && (
        <NodeContextMenu type="subject" ids={ids} name={subject.name} color={subject.color} />
      )}
      {open && subject.chapters.map((chapter) => (
        <ChapterRow key={chapter.id} subject={subject} chapter={chapter} />
      ))}
    </div>
  )
}

export default function SubjectTree() {
  const subjects = useNotebookStore((s) => s.subjects)
  const loaded = useNotebookStore((s) => s.loaded)
  const store = useNotebookStore.getState()
  return (
    <div className="side-tree">
      {loaded && subjects.length === 0 && (
        <div className="tree-empty">No notes yet — create a subject to begin.</div>
      )}
      {subjects.map((subject) => (
        <SubjectRow key={subject._id} subject={subject} />
      ))}
      <InlineAddForm />
      <div className="new-subject-row" onClick={() => store.startAdding({ type: 'subject' })}>
        ＋ New subject
      </div>
    </div>
  )
}
