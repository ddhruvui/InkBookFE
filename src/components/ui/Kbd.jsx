export default function Kbd({ children, className = '', ...props }) {
  return (
    <kbd className={`kbd ${className}`} {...props}>
      {children}
    </kbd>
  )
}
