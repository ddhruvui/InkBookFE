import Icon from './Icon'

// Toolbar button — variants: secondary (default) | primary | ghost | star.
// `icon` adds a leading line icon; `iconOnly` hides the label visually (it
// stays as the accessible name and tooltip).
export default function Button({ variant = 'secondary', icon, iconOnly = false, className = '', children, title, ...props }) {
  const label = typeof children === 'string' ? children : undefined
  return (
    <button
      type="button"
      className={`btn ${variant} ${iconOnly ? 'icon-only' : ''} ${className}`}
      title={title ?? (iconOnly ? label : undefined)}
      aria-label={iconOnly ? label : undefined}
      {...props}
    >
      {icon && <Icon name={icon} size={15} />}
      {iconOnly ? null : children && <span className="btn-label">{children}</span>}
    </button>
  )
}
