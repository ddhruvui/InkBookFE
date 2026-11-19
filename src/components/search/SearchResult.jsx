import Icon from '../ui/Icon'

// Wrap case-insensitive matches of q in <mark> (plain text in, React nodes out).
function Hl({ text, q }) {
  const str = String(text ?? '')
  const ql = String(q || '').trim().toLowerCase()
  if (!ql) return str
  const out = []
  let i = 0
  const lower = str.toLowerCase()
  for (let at = lower.indexOf(ql); at !== -1; at = lower.indexOf(ql, i)) {
    if (at > i) out.push(str.slice(i, at))
    out.push(<mark key={at}>{str.slice(at, at + ql.length)}</mark>)
    i = at + ql.length
  }
  out.push(str.slice(i))
  return out
}

export default function SearchResult({ result, q, active, onOpen, onHover, id }) {
  const starred = result.title.startsWith('★ ')
  return (
    <div
      id={id}
      role="option"
      aria-selected={active}
      className={`pal-result ${active ? 'active' : ''}`}
      onClick={onOpen}
      onMouseMove={onHover}
    >
      <span className={`pal-result-icon ${starred ? 'star' : ''}`}>
        <Icon name={starred ? 'star' : 'file'} size={15} style={starred ? { fill: 'currentColor' } : undefined} />
      </span>
      <span className="pal-result-main">
        <span className="pal-result-title">
          <Hl text={starred ? result.title.slice(2) : result.title} q={q} />
        </span>
        <span className="pal-result-snippet">
          <Hl text={result.snippet} q={q} />
        </span>
      </span>
      <span className="pal-result-path">{result.path}</span>
      {active && <Icon name="enter" size={14} className="pal-result-enter" />}
    </div>
  )
}
