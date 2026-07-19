import { useMemo } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

// KaTeX render inside the prototype's dashed card; falls back to the
// prototype's mono styling when KaTeX can't parse the formula.
export default function MathBlock({ block }) {
  const text = block.payload.text || ''
  const rendered = useMemo(() => {
    try {
      return katex.renderToString(text, { throwOnError: true, strict: false })
    } catch {
      return null
    }
  }, [text])
  if (rendered) {
    return <div className="math-block" dangerouslySetInnerHTML={{ __html: rendered }} />
  }
  return <div className="math-block">{text}</div>
}
