import useNotebookStore from '../store/useNotebookStore'
import { useNav, useCurrentRef } from '../hooks/useNav'
import Icon from './ui/Icon'

function Tab({ icon, label, onClick, active }) {
  return (
    <button type="button" className={`bottom-btn ${active ? 'active' : ''}`} onClick={onClick} aria-label={label}>
      <Icon name={icon} size={20} />
      <span className="bottom-label">{label}</span>
    </button>
  )
}

export default function MobileBottomBar() {
  const { goHome } = useNav()
  const ref = useCurrentRef()
  const openPalette = useNotebookStore((s) => s.openPalette)
  const setDrawer = useNotebookStore((s) => s.setDrawer)
  const openScan = useNotebookStore((s) => s.openScan)
  const onHome = !ref.subjectId
  return (
    <nav className="nb-bottom no-print" aria-label="Quick actions">
      <Tab icon="home" label="Home" onClick={goHome} active={onHome} />
      <Tab icon="search" label="Search" onClick={openPalette} />
      <button type="button" className="bottom-scan" onClick={() => openScan(ref)} aria-label="Scan notes">
        <Icon name="camera" size={22} />
      </button>
      <Tab icon="books" label="Notebook" onClick={() => setDrawer(true)} />
      <Tab icon="star" label="Starred" onClick={() => useNotebookStore.setState({ palOpen: true, palQ: '', palFilter: 'important', drawerOpen: false })} />
    </nav>
  )
}
