import { useCallback, useState } from 'react'

// Tracks the current text selection (prototype onSelect): >3 chars arms
// ★ Mark important. Also records where the selection sits on screen so a
// floating ★ button can appear right next to it.
export function useSelectionText() {
  const [sel, setSel] = useState({ text: '', rect: null })

  const read = useCallback(() => {
    const s = window.getSelection && window.getSelection()
    const text = String(s ?? '').trim()
    let rect = null
    const range = text && s.rangeCount ? s.getRangeAt(0) : null
    if (range && typeof range.getBoundingClientRect === 'function') {
      const r = range.getBoundingClientRect()
      if (r && (r.width || r.height)) rect = { top: r.top, bottom: r.bottom, left: r.left, width: r.width }
    }
    setSel({ text, rect })
  }, [])

  // Touch selections settle after touchend — read on the next tick.
  const onMouseUp = useCallback(() => read(), [read])
  const onTouchEnd = useCallback(() => setTimeout(read, 0), [read])
  const clear = useCallback(() => setSel({ text: '', rect: null }), [])

  return { selText: sel.text, selRect: sel.rect, selActive: sel.text.length > 3, onMouseUp, onTouchEnd, clear }
}
