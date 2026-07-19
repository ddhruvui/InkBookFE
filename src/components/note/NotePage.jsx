import { useEffect, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import useNotebookStore, { findTopic } from '../../store/useNotebookStore'
import { useNav } from '../../hooks/useNav'
import { useSelectionText } from '../../hooks/useSelectionText'
import { insertPrefill } from '../../utils/blocks'
import Button from '../ui/Button'
import SaveButton from '../ui/SaveButton'
import EditableTitle from './EditableTitle'
import HighlightChip from './HighlightChip'
import LinkedFromPanel from './LinkedFromPanel'
import BlockList from '../blocks/BlockList'
import QuickComposer from '../blocks/QuickComposer'

export default function NotePage() {
  const { s, c, t } = useParams()
  const subjects = useNotebookStore((s2) => s2.subjects)
  const loaded = useNotebookStore((s2) => s2.loaded)
  const undoTick = useNotebookStore((s2) => s2.undoTick)
  const store = useNotebookStore.getState()
  const { goChapter } = useNav()
  const { selText, selActive, onMouseUp, clear } = useSelectionText()
  // editing: { blockId, initialText? } — initialText set for freshly inserted blocks
  const [editing, setEditing] = useState(null)

  // Reset editor/selection state when navigating between topics or undoing.
  useEffect(() => {
    setEditing(null)
    clear()
  }, [t, undoTick, clear])

  if (!loaded) return <div className="nb-scroll" />
  const found = findTopic(subjects, s, c, t)
  if (!found) return <Navigate to="/" replace />
  const { subject, chapter, topic } = found

  const startEdit = (block) => setEditing({ blockId: block.id })
  const closeEdit = () => setEditing(null)

  const onInsert = (kind) => {
    const block = store.addBlock(topic.id, kind)
    if (!block) return
    if (kind !== 'image') setEditing({ blockId: block.id, initialText: insertPrefill(kind) })
  }

  const markImportant = () => {
    store.markImportant(topic.id, selText)
    clear()
    const sel = window.getSelection()
    if (sel) sel.removeAllRanges()
  }

  return (
    <>
      <div className="nb-toolbar no-print">
        <span className="nb-burger burger-sm" onClick={() => store.setDrawer(true)}>☰</span>
        <div className="crumb">{subject.name}  ›  {chapter.name}  ›  {topic.name}</div>
        <Button
          variant="primary"
          onClick={() => store.openScan({ subjectId: subject._id, chapterId: chapter.id, topicId: topic.id })}
        >
          📷 Scan into this topic
        </Button>
        <Button title="Undo last change" onClick={() => store.undo()}>↩ Undo</Button>
        <SaveButton />
        {selActive && (
          <Button variant="star" onClick={markImportant}>★ Mark important</Button>
        )}
        <Button
          title="Summarize this chapter"
          onClick={() => {
            store.summarizeChapter(subject._id, chapter.id)
            goChapter(subject._id, chapter.id)
          }}
        >
          ✦ Summarize
        </Button>
        <Button
          onClick={() =>
            store.openExport({ subjectId: subject._id, chapterId: chapter.id, topicId: topic.id }, 'topic')
          }
        >
          ⇩ Export
        </Button>
        <Button onClick={() => window.print()}>⎙ Print</Button>
      </div>
      <div className="nb-scroll" onMouseUp={onMouseUp}>
        <div className="nb-page">
          <EditableTitle topic={topic} />
          <div style={{ marginBottom: 16 }} />
          <HighlightChip />
          <BlockList topic={topic} editing={editing} onStartEdit={startEdit} onCloseEdit={closeEdit} />
          <LinkedFromPanel topic={topic} />
          <QuickComposer topicId={topic.id} onInsert={onInsert} />
        </div>
      </div>
    </>
  )
}
