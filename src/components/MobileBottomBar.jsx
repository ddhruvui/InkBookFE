import useNotebookStore from '../store/useNotebookStore'
import { useNav, useCurrentRef } from '../hooks/useNav'

export default function MobileBottomBar() {
  const { goHome } = useNav()
  const ref = useCurrentRef()
  const openPalette = useNotebookStore((s) => s.openPalette)
  const setDrawer = useNotebookStore((s) => s.setDrawer)
  const openScan = useNotebookStore((s) => s.openScan)
  return (
    <div className="nb-bottom no-print">
      <span className="bottom-btn" onClick={goHome}>🏠</span>
      <span className="bottom-btn" onClick={openPalette}>🔍</span>
      <span className="bottom-scan" onClick={() => openScan(ref)}>📷</span>
      <span className="bottom-btn" onClick={() => setDrawer(true)}>🗂</span>
    </div>
  )
}
