import Icon from '../ui/Icon'

// ✦ Chapter summary panel — staged point-by-point reveal (~350ms apart,
// driven by the store's summarizeChapter action) with a thinking pulse.
// items: [{head: topicName} | {point: text}].
export default function SummaryPanel({ open, loading, items, onClose }) {
  if (!open) return null
  return (
    <section className="summary-panel no-print" aria-live="polite">
      <div className="summary-head">
        <Icon name="sparkles" size={15} className="summary-icon" />
        <span className="summary-label">Chapter summary</span>
        {loading && <span className="summary-thinking">thinking…</span>}
        <span style={{ flex: 1 }} />
        <button type="button" className="icon-btn sm" aria-label="Close summary" onClick={onClose}>
          <Icon name="x" size={14} />
        </button>
      </div>
      {loading && items.length === 0 && (
        <div className="summary-skeleton">
          <div className="skeleton sk-line" />
          <div className="skeleton sk-line short" />
        </div>
      )}
      {items.map((item, i) =>
        item.head != null ? (
          <div key={i} className="summary-topic">{item.head}</div>
        ) : (
          <div key={i} className="summary-point">
            <span className="summary-bullet" />
            <span>{item.point}</span>
          </div>
        )
      )}
    </section>
  )
}
