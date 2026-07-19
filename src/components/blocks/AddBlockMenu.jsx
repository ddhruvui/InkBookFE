import { INSERT_DEFS } from '../../utils/blocks'

// Chip menu shown by ＋ Add block: ¶ Paragraph, { } Code, ⇄ Before / after,
// ∑ Math, ☑ To-do, ▦ Table, 🖼 Image.
export default function AddBlockMenu({ onPick }) {
  return (
    <div className="insert-menu">
      {INSERT_DEFS.map((def) => (
        <span key={def.kind} className="insert-chip" onClick={() => onPick(def.kind)}>
          {def.label}
        </span>
      ))}
    </div>
  )
}
