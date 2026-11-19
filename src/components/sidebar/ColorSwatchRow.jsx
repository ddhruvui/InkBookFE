import Icon from '../ui/Icon'

// Swatch row inside the subject ⋯ menu — palette colors, current outlined.
export default function ColorSwatchRow({ colors, current, onPick }) {
  return (
    <div className="menu-colors" role="group" aria-label="Subject color">
      <Icon name="palette" size={15} className="menu-icon" />
      {colors.map((c) => (
        <button
          type="button"
          key={c}
          className={`menu-swatch ${current === c ? 'current' : ''}`}
          style={{ background: c }}
          aria-label={`Color ${c}`}
          aria-pressed={current === c}
          onClick={(e) => {
            e.stopPropagation()
            onPick(c)
          }}
        />
      ))}
    </div>
  )
}
