import Icon from '../ui/Icon'

// Floating "★ Mark important" pill next to the current text selection.
// mousedown is cancelled so clicking it never collapses the selection.
export default function SelectionStar({ rect, onMark }) {
  if (!rect) return null
  const above = rect.top > 96
  const style = {
    top: above ? rect.top - 44 : rect.bottom + 10,
    left: Math.min(Math.max(rect.left + rect.width / 2, 90), window.innerWidth - 90),
  }
  return (
    <button
      type="button"
      className="sel-star no-print"
      style={style}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onMark}
    >
      <Icon name="star" size={14} style={{ fill: 'currentColor' }} />
      Mark important
    </button>
  )
}
