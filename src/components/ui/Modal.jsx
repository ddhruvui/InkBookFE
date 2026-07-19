// Backdrop + fadeUp card. Clicking the backdrop closes; the card stops propagation.
export default function Modal({ onClose, overlayClassName = '', cardClassName = '', children }) {
  return (
    <div className={`modal-overlay no-print ${overlayClassName}`} onClick={onClose}>
      <div className={`modal-card ${cardClassName}`} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}
