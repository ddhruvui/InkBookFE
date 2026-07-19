// ✦ Chapter summary panel — cream card, staged point-by-point reveal (~350ms
// apart, driven by the store's summarizeChapter action), thinking pulse.
// items: [{head: topicName} | {point: text}] — a faint uppercase topic header
// row followed by its "› point" lines, exactly per README §2.
export default function SummaryPanel({ open, loading, items, onClose }) {
  if (!open) return null
  return (
    <div className="summary-panel no-print">
      <div className="summary-head">
        <span className="summary-label">✦ CHAPTER SUMMARY</span>
        {loading && <span className="summary-thinking">thinking…</span>}
        <span style={{ flex: 1 }} />
        <span className="summary-close" onClick={onClose}>✕</span>
      </div>
      {items.map((item, i) =>
        item.head != null ? (
          <div key={i} className="summary-topic">{item.head}</div>
        ) : (
          <div key={i} className="summary-point">
            <span>›</span>
            <span>{item.point}</span>
          </div>
        )
      )}
    </div>
  )
}
