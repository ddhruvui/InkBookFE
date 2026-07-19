export default function SearchResult({ result, onOpen }) {
  return (
    <div className="pal-result" onClick={onOpen}>
      <div className="pal-result-title">{result.title}</div>
      <div className="pal-result-path">{result.path}</div>
      <div className="pal-result-snippet">{result.snippet}</div>
    </div>
  )
}
