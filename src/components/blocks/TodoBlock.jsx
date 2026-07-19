// 18px accent checkbox; label strikethrough + faint when done. Click toggles.
export default function TodoBlock({ block, onToggle }) {
  const done = !!block.payload.done
  return (
    <div className="todo-block" onClick={onToggle}>
      <span className={`todo-box ${done ? 'done' : ''}`}>{done ? '✓' : ''}</span>
      <span className={`todo-label ${done ? 'done' : ''}`}>{block.payload.text}</span>
    </div>
  )
}
