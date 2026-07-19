// Full-width topic card on the chapter overview.
export default function TopicCard({ topic, onOpen }) {
  return (
    <div className="topic-card" onClick={onOpen}>
      <div style={{ flex: 1 }}>
        <div className="topic-card-name">{topic.name}</div>
      </div>
      <span className="topic-card-arrow">→</span>
    </div>
  )
}
