import useNotebookStore from '../store/useNotebookStore'

// Compiled scoped print view — visible only under @media print.
// Content is compiled by utils/exportHtml (text blocks sanitized with DOMPurify).
export default function PrintView() {
  const printHtml = useNotebookStore((s) => s.printHtml)
  return (
    <div
      className="nb-printview"
      style={{ background: '#fff', color: '#3a3128', fontFamily: "'Lora',serif", padding: 20 }}
      dangerouslySetInnerHTML={{ __html: printHtml || '' }}
    />
  )
}
