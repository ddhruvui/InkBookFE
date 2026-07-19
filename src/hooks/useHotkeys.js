import { useEffect } from 'react'
import useNotebookStore from '../store/useNotebookStore'

// Global shortcuts, matching the prototype exactly:
// ⌘/Ctrl+Z undo (ignored while typing) · ⌘/Ctrl+S save · ⌘/Ctrl+K palette · Esc closes.
export function useHotkeys() {
  useEffect(() => {
    const onKeyDown = (e) => {
      const tag = (e.target && e.target.tagName) || ''
      const st = useNotebookStore.getState()
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault()
        st.undo()
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        st.save()
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        st.togglePalette()
      }
      if (e.key === 'Escape') st.escapeAll()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}

// Warn before leaving with unsaved changes.
export function useBeforeUnload() {
  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (useNotebookStore.getState().dirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [])
}
