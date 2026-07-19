import useNotebookStore from '../../store/useNotebookStore'
import { useNav } from '../../hooks/useNav'
import Kbd from '../ui/Kbd'
import SubjectTree from './SubjectTree'

export default function Sidebar() {
  const drawerOpen = useNotebookStore((s) => s.drawerOpen)
  const openPalette = useNotebookStore((s) => s.openPalette)
  const { goHome } = useNav()
  return (
    <div className={`nb-side no-print ${drawerOpen ? 'open' : ''}`}>
      <div className="side-head" onClick={goHome}>
        <div className="side-logo">✎</div>
        <div className="side-title">Inkbook</div>
      </div>
      <div className="side-search-wrap">
        <div className="side-search" onClick={openPalette}>
          <span className="side-search-label">Search notes…</span>
          <Kbd>⌘K</Kbd>
        </div>
      </div>
      <SubjectTree />
    </div>
  )
}
