// All / Only <subject> / ★ Important / Scans
export default function FilterPills({ filters, active, onPick }) {
  return (
    <div className="pal-filters">
      {filters.map((f) => (
        <span
          key={f.id}
          className={`pal-pill ${active === f.id ? 'active' : ''}`}
          onClick={() => onPick(f.id)}
        >
          {f.label}
        </span>
      ))}
    </div>
  )
}
