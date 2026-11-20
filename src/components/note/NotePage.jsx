import { useEffect, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import useNotebookStore, { findTopic } from '../../store/useNotebookStore'
import { useNav } from '../../hooks/useNav'
import { useSelectionText } from '../../hooks/useSelectionText'
import TopBar from '../layout/TopBar'
import Button from '../ui/Button'
import SaveButton from '../ui/SaveButton'
import Icon from '../ui/Icon'
import EditableTitle from './EditableTitle'
import HighlightChip from './HighlightChip'
import LinkedFromPanel from './LinkedFromPanel'
import SelectionStar from './SelectionStar'
import BlockList from '../blocks/BlockList'
import QuickComposer from '../blocks/QuickComposer'

export default function NotePage() {
  const { s, c, t } = useParams()
  const subjects = useNotebookStore((s2) => s2.subjects)
  const loaded = useNotebookStore((s2) => s2.loaded)
  const undoTick = useNotebookStore((s2) => s2.undoTick)
  const canUndo = useNotebookStore((s2) => s2.undoStack.length > 0)
  const store = useNotebookStore.getState()
  const { goSubject, goChapter } = useNav()
  const { selText, selRect, selActive, onMouseUp, onTouchEnd, clear } = useSelectionText()
  // editing: { blockId } for an existing block, or { draft: kind, initialText }
  // for a new block that is only added to the store when the editor is saved
  const [editing, setEditing] = useState(null)

  // Reset editor/selection state when navigating between topics or undoing.
  useEffect(() => {
    setEditing(null)
    clear()
  }, [t, undoTick, clear])

  if (!loaded) return <div className="nb-scroll" />
  // No :c in the URL → a topic that sits directly in the subject (chapter null).
  const found = findTopic(subjects, s, c || null, t)
  if (!found) return <Navigate to="/" replace />
  const { subject, chapter, topic } = found

  const startEdit = (block) => setEditing({ blockId: block.id })
  const closeEdit = () => setEditing(null)

  const onInsert = (kind) => {
    // Image inserts an empty dropzone right away — there is no editor to cancel.
    if (kind === 'image') {
      store.addBlock(topic.id, kind)
      return
    }
    setEditing({ draft: kind })
  }

  // A table pasted into the composer opens the grid editor prefilled.
  const onPasteTable = (rows, rawText) => setEditing({ draft: 'table', initialRows: rows, pastedFrom: rawText || ' ' })
  const keepAsText = (rawText) => {
    closeEdit()
    if (rawText.trim()) store.appendTextBlock(topic.id, rawText.trim())
  }

  const markImportant = () => {
    store.markImportant(topic.id, selText)
    clear()
    const sel = window.getSelection()
    if (sel) sel.removeAllRanges()
  }

  const ids = { subjectId: subject._id, chapterId: chapter ? chapter.id : null, topicId: topic.id }

  return (
    <>
      <TopBar
        crumbs={[
          { label: subject.name, color: subject.color, onClick: () => goSubject(subject._id) },
          ...(chapter ? [{ label: chapter.name, onClick: () => goChapter(subject._id, chapter.id) }] : []),
          { label: topic.name },
        ]}
      >
        {selActive && (
          <Button variant="star" icon="star" className="show-touch" onClick={markImportant}>
            Mark important
          </Button>
        )}
        <Button variant="primary" icon="camera" className="hide-mobile" title="Scan handwritten notes into this topic" onClick={() => store.openScan(ids)}>
          Scan
        </Button>
        <span className="toolbar-group">
          <Button icon="undo" iconOnly disabled={!canUndo} onClick={() => store.undo()}>
            Undo (⌘Z)
          </Button>
          {chapter && (
            <Button
              icon="sparkles"
              iconOnly
              onClick={() => {
                store.summarizeChapter(subject._id, chapter.id)
                goChapter(subject._id, chapter.id)
              }}
            >
              Summarize this chapter
            </Button>
          )}
          <Button icon="download" iconOnly onClick={() => store.openExport(ids, 'topic')}>
            Export PDF
          </Button>
          <Button icon="printer" iconOnly onClick={() => window.print()}>
            Print
          </Button>
        </span>
        <SaveButton />
      </TopBar>
      <div className="nb-scroll" onMouseUp={onMouseUp} onTouchEnd={onTouchEnd} onScroll={selRect ? clear : undefined}>
        <article className="nb-page note-page" style={{ '--subject': subject.color }}>
          <EditableTitle topic={topic} />
          <HighlightChip />
          {topic.blocks.length === 0 && !editing && (
            <div className="empty-topic no-print">
              <Icon name="paragraph" size={18} />
              <span>This page is empty. Start typing below, or paste a table straight from Excel, Google Sheets or a web page.</span>
            </div>
          )}
          <div className="block-list">
            <BlockList topic={topic} editing={editing} onStartEdit={startEdit} onCloseEdit={closeEdit} onKeepAsText={keepAsText} />
          </div>
          <QuickComposer topicId={topic.id} onInsert={onInsert} onPasteTable={onPasteTable} />
          <LinkedFromPanel topic={topic} />
        </article>
      </div>
      {selActive && <SelectionStar rect={selRect} onMark={markImportant} />}
    </>
  )
}
