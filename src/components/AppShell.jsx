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

export default function AppShell() {
  const drawerOpen = useNotebookStore((s) => s.drawerOpen)
  const printHtml = useNotebookStore((s) => s.printHtml)
  const loaded = useNotebookStore((s) => s.loaded)

  useHotkeys()
  useBeforeUnload()

  useEffect(() => {
    if (!useNotebookStore.getState().loaded) useNotebookStore.getState().load()
  }, [])

  return (
    <>
      <div className={`nb-app ${printHtml ? 'print-hidden' : ''}`}>
        <Sidebar />
        {drawerOpen && (
          <div className="nb-scrim nb-scrim-el no-print" onClick={() => useNotebookStore.getState().setDrawer(false)} />
        )}
        <div className="nb-main">{loaded ? <Outlet /> : <div className="nb-scroll" />}</div>
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
