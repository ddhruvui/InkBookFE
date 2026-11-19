import Icon from './Icon'

// Backdrop + fadeUp card. Clicking the backdrop closes; the card stops propagation.
// Optional `title` renders the shared header (icon, title, subtitle, ✕).
export default function Modal({ onClose, overlayClassName = '', cardClassName = '', title, icon, subtitle, children }) {
  return (
    <div className={`modal-overlay no-print ${overlayClassName}`} onClick={onClose}>
      <div
        className={`modal-card ${cardClassName}`}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="modal-head">
            {icon && (
              <span className="modal-head-icon">
                <Icon name={icon} size={17} />
              </span>
            )}
            <div className="modal-head-text">
              <div className="modal-title">{title}</div>
              {subtitle && <div className="modal-sub">{subtitle}</div>}
            </div>
            <button type="button" className="icon-btn modal-close" aria-label="Close dialog" title="Close (Esc)" onClick={onClose}>
              <Icon name="x" size={16} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
