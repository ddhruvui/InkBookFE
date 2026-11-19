import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import useNotebookStore from '../store/useNotebookStore'
import { useHotkeys, useBeforeUnload } from '../hooks/useHotkeys'
import Sidebar from './sidebar/Sidebar'
import MobileBottomBar from './MobileBottomBar'
import SearchPalette from './search/SearchPalette'
import ExportModal from './ExportModal'
import ImportantModal from './chapter/ImportantModal'
import ScanWizard from './scan/ScanWizard'
import Toast from './ui/Toast'
import PrintView from './PrintView'

// Skeleton while the notebook loads — keeps layout stable instead of a blank pane.
function LoadingPage() {
  return (
    <div className="nb-scroll" aria-busy="true">
      <div className="nb-page">
        <div className="skeleton sk-title" />
        <div className="skeleton sk-line" />
        <div className="skeleton sk-line" />
        <div className="skeleton sk-line short" />
      </div>
    </div>
  )
}

export default function AppShell() {
  const drawerOpen = useNotebookStore((s) => s.drawerOpen)
  const printHtml = useNotebookStore((s) => s.printHtml)
  const loaded = useNotebookStore((s) => s.loaded)
  const sideCollapsed = useNotebookStore((s) => s.sideCollapsed)

  useHotkeys()
  useBeforeUnload()

  useEffect(() => {
    if (!useNotebookStore.getState().loaded) useNotebookStore.getState().load()
    // Re-sync when the tab regains focus so edits made on another device
    // (e.g. the phone) show up here instead of being autosaved over.
    const onFocus = () => useNotebookStore.getState().refresh()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [])

  return (
    <>
      <div className={`nb-app ${printHtml ? 'print-hidden' : ''} ${sideCollapsed ? 'side-collapsed' : ''}`}>
        <Sidebar />
        {drawerOpen && (
          <div className="nb-scrim nb-scrim-el no-print" onClick={() => useNotebookStore.getState().setDrawer(false)} />
        )}
        <main className="nb-main">{loaded ? <Outlet /> : <LoadingPage />}</main>
      </div>
      <MobileBottomBar />
      <SearchPalette />
      <ExportModal />
      <ImportantModal />
      <ScanWizard />
      <PrintView />
      <Toast />
    </>
  )
}
