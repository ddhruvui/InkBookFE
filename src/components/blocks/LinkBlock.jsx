import Icon from '../ui/Icon'

// Horizontal link card — opens in a new tab.
export default function LinkBlock({ block }) {
  const { text, url } = block.payload
  const href = /^https?:\/\//i.test(url || '') ? url : 'https://' + (url || '')
  let host = url
  try {
    host = new URL(href).host
  } catch {
    // keep the raw text
  }
  return (
    <a className="link-block" href={href} target="_blank" rel="noreferrer">
      <span className="link-tile">
        <Icon name="link" size={18} />
      </span>
      <span className="link-main">
        <span className="link-title">{text}</span>
        <span className="link-url">{host}</span>
      </span>
      <Icon name="arrowRight" size={16} className="link-arrow" />
    </a>
  )
}
