// 210px recent-topic card: subject color dot, topic name, "Subject › Chapter".
export default function RecentCard({ color, title, path, onOpen }) {
  return (
    <div className="recent-card" onClick={onOpen}>
      <div className="recent-dot" style={{ background: color }} />
      <div className="recent-title">{title}</div>
      <div className="recent-path">{path}</div>
    </div>
  )
}
