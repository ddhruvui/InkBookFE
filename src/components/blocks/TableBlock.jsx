import useNotebookStore from '../../store/useNotebookStore'
import { highlightHtml, sanitizeHtml } from '../../utils/richtext'
import { rowsToTsv } from '../../utils/table'
import Icon from '../ui/Icon'

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function copy(text, label) {
  const toast = useNotebookStore.getState().toast
  navigator.clipboard
    .writeText(text)
    .then(() => toast(label))
    .catch(() => toast('Copy blocked by browser'))
}

// Full-width table — first row is the header strip. Scrolls sideways when wide,
// long values wrap; click a cell to copy it, ⧉ Copy copies the whole table as
// tab-separated text (pastes straight into Sheets / Excel), double-click edits.
export default function TableBlock({ block, onStartEdit }) {
  const rows = block.payload.rows || []
  const hlQ = useNotebookStore((s) => s.hlQ)
  const [head, ...body] = rows
  const width = Math.max(0, ...rows.map((r) => r.length))
  const pad = (r) => (r.length < width ? [...r, ...Array(width - r.length).fill('')] : r)
  const cellHtml = (c) => sanitizeHtml(highlightHtml(esc(c).replace(/\n/g, '<br>'), hlQ))

  const onCellClick = (value) => {
    const sel = window.getSelection && window.getSelection()
    if (sel && String(sel).trim()) return // selecting text for ★ — don't copy
    if (!String(value).trim()) return
    const short = value.length > 28 ? value.slice(0, 28) + '…' : value
    copy(value, `⧉ Copied “${short}”`)
  }

  return (
    <div className="table-card">
      <div className="table-head no-print">
        <span className="table-meta"><Icon name="table" size={13} /> {rows.length} × {width} · click a cell to copy</span>
        <span className="table-head-actions">
          <button type="button" className="copy-btn" title="Copy as tab-separated — pastes into Sheets / Excel" onClick={() => copy(rowsToTsv(rows), '⧉ Table copied — paste into Sheets, Excel or another note')}>
            <Icon name="copy" size={13} /> Copy
          </button>
          {onStartEdit && (
            <button type="button" className="copy-btn" onClick={onStartEdit}><Icon name="pencil" size={13} /> Edit</button>
          )}
        </span>
      </div>
      <div className="table-scroll" onDoubleClick={onStartEdit}>
        <table className="table-block">
          {head && (
            <thead>
              <tr>
                {pad(head).map((cell, ci) => (
                  <th key={ci} onClick={() => onCellClick(cell)} dangerouslySetInnerHTML={{ __html: cellHtml(cell) }} />
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {body.map((row, ri) => (
              <tr key={ri}>
                {pad(row).map((cell, ci) => (
                  <td key={ci} title={cell ? 'Click to copy' : undefined} onClick={() => onCellClick(cell)} dangerouslySetInnerHTML={{ __html: cellHtml(cell) }} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
