import Icon from './Icon'

// Square icon-only control with a tooltip + accessible name.
export default function IconButton({ icon, label, size = 16, className = '', ...props }) {
  return (
    <button type="button" className={`icon-btn ${className}`} title={label} aria-label={label} {...props}>
      <Icon name={icon} size={size} />
    </button>
  )
}
