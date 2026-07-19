// Horizontal link card — opens in a new tab.
export default function LinkBlock({ block }) {
  const { text, url } = block.payload
  const href = /^https?:\/\//i.test(url || '') ? url : 'https://' + (url || '')
  return (
    <a className="link-block" href={href} target="_blank" rel="noreferrer">
      <div className="link-tile">🔗</div>
      <div>
        <div className="link-title">{text}</div>
        <div className="link-url">{url}</div>
      </div>
    </a>
  )
}
