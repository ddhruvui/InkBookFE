import { useEffect, useRef, useState } from 'react'
import useNotebookStore, { searchNotes, findSubject } from '../../store/useNotebookStore'
import { useNav, useCurrentRef } from '../../hooks/useNav'
import Icon from '../ui/Icon'
import Kbd from '../ui/Kbd'
import FilterPills from './FilterPills'
import SearchResult from './SearchResult'

const FILTER_ORDER = ['all', 'subject', 'important', 'scans']

// ⌘K palette: 4 filter pills, max 8 results, match highlighting on open.
// Keyboard: ↑ / ↓ move, Enter opens, Tab cycles filters, Esc closes.
export default function SearchPalette() {
  const palOpen = useNotebookStore((s) => s.palOpen)
  if (!palOpen) return null
  return <Palette />
}

function Palette() {
  const palQ = useNotebookStore((s) => s.palQ)
  const palFilter = useNotebookStore((s) => s.palFilter)
  const subjects = useNotebookStore((s) => s.subjects)
  const important = useNotebookStore((s) => s.important)
  const store = useNotebookStore.getState()
  const { goTopic } = useNav()
  const current = useCurrentRef()
  const [active, setActive] = useState(0)
  const listRef = useRef(null)

  const currentSubject = current.subjectId ? findSubject(subjects, current.subjectId) : null
  const filters = [
    { id: 'all', label: 'All' },
    { id: 'subject', label: currentSubject ? 'Only ' + currentSubject.name : 'This subject' },
    { id: 'important', label: '★ Important' },
    { id: 'scans', label: 'Scans' },
  ]
  const results = searchNotes(subjects, important, palQ, palFilter, current.subjectId)
  const sel = Math.min(active, Math.max(0, results.length - 1))

  // New query / filter → back to the top result.
  useEffect(() => setActive(0), [palQ, palFilter])

  useEffect(() => {
    listRef.current?.querySelector('.pal-result.active')?.scrollIntoView?.({ block: 'nearest' })
  }, [sel])

  const open = (r) => r && goTopic(r.subjectId, r.chapterId, r.topicId, { hl: r.hl })

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      open(results[sel])
    } else if (e.key === 'Tab') {
      e.preventDefault()
      const i = FILTER_ORDER.indexOf(palFilter)
      const n = FILTER_ORDER.length
      store.setPalFilter(FILTER_ORDER[(i + (e.shiftKey ? n - 1 : 1)) % n])
    }
  }

  return (
    <div className="pal-overlay no-print" onClick={() => store.closePalette()}>
      <div className="pal-card" role="dialog" aria-modal="true" aria-label="Search notes" onClick={(e) => e.stopPropagation()}>
        <div className="pal-input-row">
          <Icon name="search" size={18} className="pal-icon" />
          <input
            autoFocus
            className="pal-input"
            placeholder="Search all notes…"
            value={palQ}
            role="combobox"
            aria-expanded="true"
            aria-controls="pal-results"
            aria-activedescendant={results.length ? `pal-r-${sel}` : undefined}
            onChange={(e) => store.setPalQ(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <button type="button" className="pal-esc" onClick={() => store.closePalette()}>esc</button>
        </div>
        <FilterPills filters={filters} active={palFilter} onPick={(id) => store.setPalFilter(id)} />
        <div className="pal-results" id="pal-results" role="listbox" ref={listRef}>
          {results.map((r, i) => (
            <SearchResult
              key={r.topicId + '-' + i}
              id={`pal-r-${i}`}
              result={r}
              q={palQ}
              active={i === sel}
              onHover={() => i !== sel && setActive(i)}
              onOpen={() => open(r)}
            />
          ))}
          {results.length === 0 && (
            <div className="pal-empty">
              <Icon name="search" size={20} />
              <span>No matches{palQ ? ` for “${palQ}”` : ''}.</span>
            </div>
          )}
        </div>
        <div className="pal-foot">
          <span><Kbd>↑</Kbd><Kbd>↓</Kbd> move</span>
          <span><Kbd>↵</Kbd> open</span>
          <span><Kbd>tab</Kbd> filter</span>
          <span><Kbd>esc</Kbd> close</span>
        </div>
      </div>
    </div>
  )
}
