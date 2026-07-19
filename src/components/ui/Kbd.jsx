export default function Kbd({ children, ...props }) {
  return (
    <span className="kbd" {...props}>
      {children}
    </span>
  )
}
