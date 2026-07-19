import { useCallback, useState } from 'react'

// Tracks the current text selection (prototype onSelect): >3 chars arms the
// gold ★ Mark important toolbar button.
export function useSelectionText() {
  const [selText, setSelText] = useState('')

  const onMouseUp = useCallback(() => {
    const text = String(window.getSelection() ?? '').trim()
    setSelText(text)
  }, [])

  const clear = useCallback(() => setSelText(''), [])

  return { selText, selActive: selText.length > 3, onMouseUp, clear }
}
