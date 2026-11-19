// Recent-topic card: subject color, topic name, "Subject › Chapter", preview.
export default function RecentCard({ color, title, path, snippet, onOpen, index = 0 }) {
  return (
    <button
      type="button"
      className="recent-card"
      style={{ '--subject': color, animationDelay: `${index * 40}ms` }}
      onClick={onOpen}
    >
      <div className="recent-path">
        <span className="recent-dot" />
        {path}
      </div>
      <div className="recent-title">{title}</div>
      {snippet && <div className="recent-snippet">{snippet}</div>}
    </button>
  )
}
