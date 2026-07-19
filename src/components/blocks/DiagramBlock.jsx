import { useMemo } from 'react'
import { sanitizeSvg } from '../../utils/richtext'

// Centered SVG (from AI scan conversion) + caption.
export default function DiagramBlock({ block }) {
  const svg = useMemo(() => sanitizeSvg(block.payload.svg), [block.payload.svg])
  return (
    <div className="diagram-block">
      <div dangerouslySetInnerHTML={{ __html: svg }} />
      <div className="block-caption">{block.payload.caption}</div>
    </div>
  )
}
