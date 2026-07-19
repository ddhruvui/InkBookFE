// Toolbar button — variants: secondary (default) | primary | save | star.
export default function Button({ variant = 'secondary', className = '', children, ...props }) {
  return (
    <button className={`btn ${variant} ${className}`} {...props}>
      {children}
    </button>
  )
}
