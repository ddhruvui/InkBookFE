import useNotebookStore, { searchNotes, findSubject } from '../../store/useNotebookStore'
import { useNav, useCurrentRef } from '../../hooks/useNav'
import FilterPills from './FilterPills'
import SearchResult from './SearchResult'

// ⌘K palette: 4 filter pills, max 8 results, match highlighting on open.
export default function SearchPalette() {
  const palOpen = useNotebookStore((s) => s.palOpen)
  const palQ = useNotebookStore((s) => s.palQ)
  const palFilter = useNotebookStore((s) => s.palFilter)
  const subjects = useNotebookStore((s) => s.subjects)
  const important = useNotebookStore((s) => s.important)
  const store = useNotebookStore.getState()
  const { goTopic } = useNav()
  const current = useCurrentRef()

  if (!palOpen) return null

  const currentSubject = current.subjectId ? findSubject(subjects, current.subjectId) : null
  const filters = [
    { id: 'all', label: 'All' },
    { id: 'subject', label: currentSubject ? 'Only ' + currentSubject.name : 'This subject' },
    { id: 'important', label: '★ Important' },
    { id: 'scans', label: 'Scans' },
  ]
  const results = searchNotes(subjects, important, palQ, palFilter, current.subjectId)

  return (
    <div className="pal-overlay no-print" onClick={() => store.closePalette()}>
      <div className="pal-card" onClick={(e) => e.stopPropagation()}>
        <div className="pal-input-row">
          <span className="pal-icon">🔍</span>
          <input
            autoFocus
            className="pal-input"
            placeholder="Search all notes…"
            value={palQ}
            onChange={(e) => store.setPalQ(e.target.value)}
          />
          <span className="pal-esc" onClick={() => store.closePalette()}>esc</span>
        </div>
        <FilterPills filters={filters} active={palFilter} onPick={(id) => store.setPalFilter(id)} />
        <div className="pal-results">
          {results.map((r, i) => (
            <SearchResult
              key={r.topicId + '-' + i}
              result={r}
              onOpen={() => goTopic(r.subjectId, r.chapterId, r.topicId, { hl: r.hl })}
            />
          ))}
          {results.length === 0 && <div className="pal-empty">No matches.</div>}
        </div>
      </div>
    </div>
  )
}
