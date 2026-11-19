import { INSERT_DEFS } from '../../utils/blocks'
import Icon from '../ui/Icon'

// ＋ Add block menu: Paragraph, Code, Before / after, Math, To-do, Table, Image.
export default function AddBlockMenu({ onPick }) {
  return (
    <div className="insert-menu" role="menu" aria-label="Add block">
      {INSERT_DEFS.map((def) => (
        <button type="button" role="menuitem" key={def.kind} className="insert-chip" onClick={() => onPick(def.kind)}>
          <span className="insert-icon">
            <Icon name={def.icon} size={17} />
          </span>
          <span className="insert-text">
            <span className="insert-label">{def.label}</span>
            <span className="insert-desc">{def.desc}</span>
          </span>
        </button>
      ))}
    </div>
  )
}
