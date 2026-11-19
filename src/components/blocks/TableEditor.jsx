import { useEffect, useRef, useState } from 'react'
import { cleanRows, emptyGrid, parseHtmlTable, parseTableText } from '../../utils/table'

// Spreadsheet-style editor for table blocks.
//  · Tab / Shift+Tab move across cells (Tab on the last cell adds a row)
//  · Enter moves down (adds a row at the bottom) · Shift+Enter = new line in a cell
//  · Paste a range from Excel / Sheets / Numbers, a Markdown or HTML table into any
//    cell and it fills the grid from that cell, growing it as needed
//  · ⌘/Ctrl+Enter saves · Esc cancels
export default function TableEditor({ initialRows, pastedFrom, onSave, onCancel, onKeepAsText }) {
  const [rows, setRows] = useState(() =>
    initialRows && initialRows.length ? initialRows.map((r) => [...r]) : emptyGrid(3, 2)
  )
  const [focus, setFocus] = useState({ r: 0, c: 0 })
  const gridRef = useRef(null)
  const width = Math.max(1, ...rows.map((r) => r.length))
  const grid = rows.map((r) => (r.length < width ? [...r, ...Array(width - r.length).fill('')] : r))

  // Move DOM focus whenever the focused cell changes (after adding rows/cols too).
  useEffect(() => {
    const el = gridRef.current?.querySelector(`[data-cell="${focus.r}-${focus.c}"]`)
    if (el && document.activeElement !== el) el.focus()
  }, [focus])

  const setCell = (r, c, v) =>
    setRows((prev) => {
      const next = prev.map((row) => [...row])
      while (next[r].length < width) next[r].push('')
      next[r][c] = v
      return next
    })

  const addRow = (at = grid.length) => {
    setRows((prev) => {
      const next = prev.map((row) => [...row])
      next.splice(at, 0, Array(width).fill(''))
      return next
    })
  }
  const addCol = (at = width) => {
    setRows((prev) => prev.map((row) => {
      const next = [...row]
      while (next.length < width) next.push('')
      next.splice(at, 0, '')
      return next
    }))
  }
  const removeRow = (r) => {
    if (grid.length <= 1) return setRows([Array(width).fill('')])
    setRows((prev) => prev.filter((_, i) => i !== r))
    setFocus((f) => ({ r: Math.min(f.r, grid.length - 2), c: f.c }))
  }
  const removeCol = (c) => {
    if (width <= 1) return setRows((prev) => prev.map(() => ['']))
    setRows((prev) => prev.map((row) => row.filter((_, i) => i !== c)))
    setFocus((f) => ({ r: f.r, c: Math.min(f.c, width - 2) }))
  }

  const save = () => {
    const out = cleanRows(grid)
    if (!out.length) return onCancel()
    onSave(out)
  }

  const onKeyDown = (e, r, c) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      return save()
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      return onCancel()
    }
    if (e.key === 'Tab') {
      e.preventDefault()
      if (e.shiftKey) {
        if (c > 0) setFocus({ r, c: c - 1 })
        else if (r > 0) setFocus({ r: r - 1, c: width - 1 })
        return
      }
      if (c < width - 1) return setFocus({ r, c: c + 1 })
      if (r === grid.length - 1) addRow()
      return setFocus({ r: r + 1, c: 0 })
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (r === grid.length - 1) addRow()
      return setFocus({ r: r + 1, c })
    }
  }

  // Multi-cell paste: fill the grid starting at the focused cell.
  const onPaste = (e, r, c) => {
    const data = e.clipboardData
    if (!data) return
    const text = data.getData('text/plain')
    const parsed = parseHtmlTable(data.getData('text/html')) || (/[\t\n]/.test(text.trim()) ? parseTableText(text) : null)
    if (!parsed || (parsed.length === 1 && parsed[0].length === 1)) return
    e.preventDefault()
    setRows((prev) => {
      const next = prev.map((row) => [...row])
      const needRows = r + parsed.length
      const needCols = Math.max(width, c + Math.max(...parsed.map((p) => p.length)))
      while (next.length < needRows) next.push([])
      next.forEach((row) => { while (row.length < needCols) row.push('') })
      parsed.forEach((pr, i) => pr.forEach((v, j) => { next[r + i][c + j] = v }))
      return next
    })
  }

  const filled = cleanRows(grid)

  return (
    <div className="block-editor table-editor" onKeyDown={(e) => e.key === 'Escape' && e.stopPropagation()}>
      <div className="editor-head">
        <span className="editor-label">Table</span>
        <span className="editor-hint">First row is the header · Tab / Enter to move</span>
      </div>
      {pastedFrom && (
        <div className="table-paste-note">
          ▦ Pasted {filled.length} × {filled[0]?.length || 0} from your clipboard — check it and save.
          {onKeepAsText && (
            <span className="table-paste-alt" onClick={onKeepAsText}>Keep as plain text instead</span>
          )}
        </div>
      )}
      <div className="table-grid-wrap" ref={gridRef}>
        <table className="table-grid">
          <thead>
            <tr>
              <th className="tg-corner" />
              {grid[0].map((_, c) => (
                <th key={c} className="tg-colhead">
                  <span className="tg-btn" title="Insert column to the left" onClick={() => addCol(c)}>＋</span>
                  <span className="tg-btn danger" title="Delete column" onClick={() => removeCol(c)}>×</span>
                </th>
              ))}
              <th className="tg-corner">
                <span className="tg-btn" title="Add column" onClick={() => addCol()}>＋</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {grid.map((row, r) => (
              <tr key={r} className={r === 0 ? 'tg-header-row' : ''}>
                <td className="tg-rowhead">
                  <span className="tg-btn danger" title="Delete row" onClick={() => removeRow(r)}>×</span>
                </td>
                {row.map((cell, c) => (
                  <td key={c} className={focus.r === r && focus.c === c ? 'tg-cell focused' : 'tg-cell'}>
                    <textarea
                      data-cell={`${r}-${c}`}
                      rows={1}
                      value={cell}
                      placeholder={r === 0 ? `Header ${c + 1}` : ''}
                      onChange={(e) => setCell(r, c, e.target.value)}
                      onFocus={() => (focus.r !== r || focus.c !== c) && setFocus({ r, c })}
                      onKeyDown={(e) => onKeyDown(e, r, c)}
                      onPaste={(e) => onPaste(e, r, c)}
                      autoFocus={r === 0 && c === 0}
                    />
                  </td>
                ))}
                <td />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="editor-btn-row table-editor-foot">
        <span className="tg-add-row" onClick={() => { addRow(); setFocus({ r: grid.length, c: 0 }) }}>＋ Row</span>
        <span className="tg-add-row" onClick={() => addCol()}>＋ Column</span>
        <span className="editor-kbd-hint">Tab / Enter to move · ⇧Enter new line · ⌘Enter save</span>
        <span style={{ flex: 1 }} />
        <button type="button" className="mini-btn ghost" onClick={onCancel}>Cancel</button>
        <button type="button" className="mini-btn primary" onClick={save} disabled={!filled.length}>Save</button>
      </div>
    </div>
  )
}
