// ◐ swatch row inside the subject ⋯ menu — 6 palette colors, current outlined.
export default function ColorSwatchRow({ colors, current, onPick }) {
  return (
    <div className="menu-colors">
      ◐
      {colors.map((c) => (
        <span
          key={c}
          className={`menu-swatch ${current === c ? 'current' : ''}`}
          style={{ background: c }}
          onClick={(e) => {
            e.stopPropagation()
            onPick(c)
          }}
        />
      ))}
    </div>
  )
}
