import { useState } from 'react'
import useNotebookStore from '../../store/useNotebookStore'
import AddBlockMenu from './AddBlockMenu'

// Bottom composer above a dashed divider: Enter adds a paragraph;
// ＋ Add block toggles the chip menu.
export default function QuickComposer({ topicId, onInsert }) {
  const [draft, setDraft] = useState('')
  const insertOpen = useNotebookStore((s) => s.insertOpen)
  const store = useNotebookStore.getState()

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && draft.trim()) {
      e.preventDefault()
      store.appendTextBlock(topicId, draft.trim())
      setDraft('')
    }
  }

  return (
    <div className="composer no-print">
      <div className="composer-row">
        <textarea
          className="composer-textarea"
          placeholder="Write here — Enter to add as a paragraph. Use [[Topic Name]] to link notes."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          rows={2}
        />
        <button className="composer-add-btn" onClick={() => store.setInsertOpen(!insertOpen)}>
          ＋ Add block
        </button>
      </div>
      {insertOpen && (
        <AddBlockMenu
          onPick={(kind) => {
            store.setInsertOpen(false)
            onInsert(kind)
          }}
        />
      )}
    </div>
  )
}
