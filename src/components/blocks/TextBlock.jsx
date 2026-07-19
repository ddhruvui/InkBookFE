import { useMemo } from 'react'
import useNotebookStore from '../../store/useNotebookStore'
import { decorateHtml } from '../../utils/richtext'
import { useNav } from '../../hooks/useNav'

// Lora 15px/1.85 HTML with wiki-links + ★ important underlines + search-match <mark>s.
// Sanitized with DOMPurify before dangerouslySetInnerHTML.
export default function TextBlock({ block, topicId, onStartEdit }) {
  const hlQ = useNotebookStore((s) => s.hlQ)
  const important = useNotebookStore((s) => s.important)
  const { goByName } = useNav()
  const markTexts = useMemo(
    () => important.filter((m) => m.topicId === topicId).map((m) => m.text),
    [important, topicId]
  )
  const html = useMemo(
    () => decorateHtml(block.payload.html, hlQ, markTexts),
    [block.payload.html, hlQ, markTexts]
  )
  return (
    <div
      className="text-block"
      title="Double-click to edit"
      onClick={(e) => {
        const link = e.target.getAttribute && e.target.getAttribute('data-link')
        if (link) goByName(link)
      }}
      onDoubleClick={onStartEdit}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
