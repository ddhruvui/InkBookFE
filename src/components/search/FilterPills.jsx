// All / Only <subject> / ★ Important / Scans
export default function FilterPills({ filters, active, onPick }) {
  return (
    <div className="pal-filters" role="tablist" aria-label="Search filter">
      {filters.map((f) => (
        <button
          type="button"
          role="tab"
          aria-selected={active === f.id}
          key={f.id}
          className={`pal-pill ${active === f.id ? 'active' : ''}`}
          onClick={() => onPick(f.id)}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
