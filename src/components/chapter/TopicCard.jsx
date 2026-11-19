import Icon from '../ui/Icon'

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`

// Full-width topic card on the chapter overview: name, preview, counts.
export default function TopicCard({ topic, snippet, stars = 0, index = 0, onOpen }) {
  return (
    <button type="button" className="topic-card" style={{ animationDelay: `${index * 35}ms` }} onClick={onOpen}>
      <span className="topic-card-num">{String(index + 1).padStart(2, '0')}</span>
      <span className="topic-card-body">
        <span className="topic-card-name">{topic.name}</span>
        {snippet && <span className="topic-card-snippet">{snippet}</span>}
        <span className="topic-card-meta">
          {plural(topic.blocks.length, 'block')}
          {stars > 0 && (
            <span className="topic-card-stars">
              <Icon name="star" size={12} style={{ fill: 'currentColor' }} /> {stars}
            </span>
          )}
        </span>
      </span>
      <Icon name="arrowRight" size={16} className="topic-card-arrow" />
    </button>
  )
}
