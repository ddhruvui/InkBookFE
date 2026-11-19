import { useEffect } from 'react'
import useNotebookStore from '../../store/useNotebookStore'
import { useNav, useCurrentRef } from '../../hooks/useNav'
import Icon from '../ui/Icon'
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

// Enter / Space activate a focused row like a click.
const rowKeys = (fn) => (e) => {
  if (e.target !== e.currentTarget) return
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    fn()
  }
}

function RowAction({ icon, label, onClick }) {
  return (
    <button
      type="button"
      className="row-action"
      title={label}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      <Icon name={icon} size={14} />
    </button>
  )
}

function TopicRow({ subject, chapter, topic }) {
  const menu = useNotebookStore((s) => s.menu)
  const store = useNotebookStore.getState()
  const { goTopic } = useNav()
  const current = useCurrentRef()
  const ids = { subjectId: subject._id, chapterId: chapter.id, topicId: topic.id }
  const active = current.topicId === topic.id
  const menuOpen = menuMatches(menu, 'topic', ids)
  const open = () => goTopic(subject._id, chapter.id, topic.id)
  return (
    <div>
      <div
        className={`tree-row topic-row ${active ? 'active' : ''} ${menuOpen ? 'menu-open' : ''}`}
        role="treeitem"
        aria-current={active ? 'page' : undefined}
        tabIndex={0}
        onClick={open}
        onKeyDown={rowKeys(open)}
      >
        <Icon name="file" size={14} className="topic-icon" />
        <span className="topic-name">{topic.name}</span>
        <span className="row-actions">
          <RowAction icon="more" label={`Manage “${topic.name}”`} onClick={() => store.toggleMenu({ type: 'topic', ...ids })} />
        </span>
      </div>
      {menuOpen && <NodeContextMenu type="topic" ids={ids} name={topic.name} />}
    </div>
  )
}

function ChapterRow({ subject, chapter }) {
  const menu = useNotebookStore((s) => s.menu)
  const open = useNotebookStore((s) => !!s.openChapters[chapter.id])
  const store = useNotebookStore.getState()
  const { goChapter } = useNav()
  const current = useCurrentRef()
  const ids = { subjectId: subject._id, chapterId: chapter.id, topicId: null }
  const active = current.chapterId === chapter.id && !current.topicId
  const menuOpen = menuMatches(menu, 'chapter', ids)
  const go = () => goChapter(subject._id, chapter.id)
  return (
    <div>
      <div
        className={`tree-row chapter-row ${active ? 'active' : ''} ${menuOpen ? 'menu-open' : ''}`}
        role="treeitem"
        aria-expanded={open}
        tabIndex={0}
        onClick={go}
        onKeyDown={rowKeys(go)}
      >
        <button
          type="button"
          className="tree-chev"
          aria-label={open ? 'Collapse chapter' : 'Expand chapter'}
          onClick={(e) => {
            e.stopPropagation()
            store.toggleChapterOpen(chapter.id)
          }}
        >
          <Icon name={open ? 'chevronDown' : 'chevronRight'} size={13} />
        </button>
        <span className="chapter-name">{chapter.name}</span>
        <span className="row-count">{chapter.topics.length || ''}</span>
        <span className="row-actions">
          <RowAction
            icon="plus"
            label={`Add topic to “${chapter.name}”`}
            onClick={() => store.startAdding({ type: 'topic', subjectId: subject._id, chapterId: chapter.id })}
          />
          <RowAction icon="more" label={`Manage “${chapter.name}”`} onClick={() => store.toggleMenu({ type: 'chapter', ...ids })} />
        </span>
      </div>
      {menuOpen && <NodeContextMenu type="chapter" ids={ids} name={chapter.name} />}
      {open && chapter.topics.length > 0 && (
        <div className="tree-children topics" role="group">
          {chapter.topics.map((topic) => (
            <TopicRow key={topic.id} subject={subject} chapter={chapter} topic={topic} />
          ))}
        </div>
      )}
    </div>
  )
}

function SubjectRow({ subject }) {
  const menu = useNotebookStore((s) => s.menu)
  const open = useNotebookStore((s) => !!s.openSubjects[subject._id])
  const store = useNotebookStore.getState()
  const ids = { subjectId: subject._id, chapterId: null, topicId: null }
  const menuOpen = menuMatches(menu, 'subject', ids)
  const toggle = () => store.toggleSubjectOpen(subject._id)
  return (
    <div className="tree-subject" style={{ '--subject': subject.color }}>
      <div
        className={`tree-row subject-row ${menuOpen ? 'menu-open' : ''}`}
        role="treeitem"
        aria-expanded={open}
        tabIndex={0}
        onClick={toggle}
        onKeyDown={rowKeys(toggle)}
      >
        <span className="tree-chev subject-chev" aria-hidden="true">
          <Icon name={open ? 'chevronDown' : 'chevronRight'} size={13} />
        </span>
        <span className="subject-dot" />
        <span className="subject-name">{subject.name}</span>
        <span className="row-actions">
          <RowAction
            icon="plus"
            label={`Add chapter to “${subject.name}”`}
            onClick={() => store.startAdding({ type: 'chapter', subjectId: subject._id })}
          />
          <RowAction icon="more" label={`Manage “${subject.name}”`} onClick={() => store.toggleMenu({ type: 'subject', ...ids })} />
        </span>
      </div>
      {menuOpen && <NodeContextMenu type="subject" ids={ids} name={subject.name} color={subject.color} />}
      {open && subject.chapters.length > 0 && (
        <div className="tree-children" role="group">
          {subject.chapters.map((chapter) => (
            <ChapterRow key={chapter.id} subject={subject} chapter={chapter} />
          ))}
        </div>
      )}
      {open && subject.chapters.length === 0 && (
        <button
          type="button"
          className="tree-hint"
          onClick={() => store.startAdding({ type: 'chapter', subjectId: subject._id })}
        >
          <Icon name="plus" size={13} /> Add a first chapter
        </button>
      )}
    </div>
  )
}

export default function SubjectTree() {
  const subjects = useNotebookStore((s) => s.subjects)
  const loaded = useNotebookStore((s) => s.loaded)
  const { subjectId, chapterId } = useCurrentRef()

  // Reveal the current page in the tree (deep links, refreshes, back/forward).
  useEffect(() => {
    if (loaded && subjectId) useNotebookStore.getState().openPath(subjectId, chapterId)
  }, [loaded, subjectId, chapterId])

  return (
    <div className="side-tree" role="tree" aria-label="Subjects">
      {loaded && subjects.length === 0 && (
        <div className="tree-empty">No notes yet — create a subject to begin.</div>
      )}
      {subjects.map((subject) => (
        <SubjectRow key={subject._id} subject={subject} />
      ))}
      <InlineAddForm />
    </div>
  )
}
