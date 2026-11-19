import { useState } from 'react'
import useNotebookStore from '../../store/useNotebookStore'
import { looksLikeTable, parseHtmlTable, parseTableText } from '../../utils/table'
import AddBlockMenu from './AddBlockMenu'

// Bottom composer above a dashed divider: Enter adds a paragraph, Shift+Enter
// is a new line inside it; pasting a table (Excel / Sheets / Numbers / web page /
// Markdown) opens the table editor prefilled. ＋ Add block toggles the chip menu.
export default function QuickComposer({ topicId, onInsert, onPasteTable }) {
  const [draft, setDraft] = useState('')
  const insertOpen = useNotebookStore((s) => s.insertOpen)
  const store = useNotebookStore.getState()

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && draft.trim()) {
      e.preventDefault()
      store.appendTextBlock(topicId, draft.replace(/^\n+|\s+$/g, ''))
      setDraft('')
    }
  }

  const onPaste = (e) => {
    if (!onPasteTable || !e.clipboardData) return
    const text = e.clipboardData.getData('text/plain')
    const htmlRows = parseHtmlTable(e.clipboardData.getData('text/html'))
    const rows = htmlRows && (htmlRows.length > 1 || htmlRows[0].length > 1) ? htmlRows : looksLikeTable(text) ? parseTableText(text) : null
    if (!rows) return
    e.preventDefault()
    onPasteTable(rows, text)
  }

  return (
    <div className="composer no-print">
      <div className="composer-row">
        <textarea
          className="composer-textarea"
          placeholder="Write here — Enter adds it, Shift+Enter for a new line. Paste a table from Sheets or Excel. Use [[Topic Name]] to link notes."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
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
