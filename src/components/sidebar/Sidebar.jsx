import useNotebookStore from '../../store/useNotebookStore'
import { useNav } from '../../hooks/useNav'
import Icon from '../ui/Icon'
import Kbd from '../ui/Kbd'
import ThemeToggle from '../ui/ThemeToggle'
import SubjectTree from './SubjectTree'

export default function Sidebar() {
  const drawerOpen = useNotebookStore((s) => s.drawerOpen)
  const openPalette = useNotebookStore((s) => s.openPalette)
  const startAdding = useNotebookStore((s) => s.startAdding)
  const { goHome } = useNav()
  return (
    <aside className={`nb-side no-print ${drawerOpen ? 'open' : ''}`} aria-label="Notebook">
      <button type="button" className="side-head" onClick={goHome} title="Home">
        <span className="side-logo">
          <Icon name="pencil" size={16} strokeWidth={2} />
        </span>
        <span className="side-title">Inkbook</span>
      </button>
      <div className="side-search-wrap">
        <button type="button" className="side-search" onClick={openPalette}>
          <Icon name="search" size={15} />
          <span className="side-search-label">Search notes…</span>
          <Kbd>⌘K</Kbd>
        </button>
      </div>
      <div className="side-section-label">Subjects</div>
      <SubjectTree />
      <div className="side-foot">
        <button type="button" className="new-subject-row" onClick={() => startAdding({ type: 'subject' })}>
          <Icon name="plus" size={15} />
          New subject
        </button>
        <ThemeToggle />
      </div>
    </aside>
  )
}
