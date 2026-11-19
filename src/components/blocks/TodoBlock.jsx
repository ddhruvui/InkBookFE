import Icon from '../ui/Icon'

// Accent checkbox; label strikethrough + faint when done. Click toggles.
export default function TodoBlock({ block, onToggle }) {
  const done = !!block.payload.done
  return (
    <button type="button" className={`todo-block ${done ? 'done' : ''}`} role="checkbox" aria-checked={done} onClick={onToggle}>
      <span className={`todo-box ${done ? 'done' : ''}`}>{done && <Icon name="check" size={13} strokeWidth={2.6} />}</span>
      <span className={`todo-label ${done ? 'done' : ''}`}>{block.payload.text}</span>
    </button>
  )
}
