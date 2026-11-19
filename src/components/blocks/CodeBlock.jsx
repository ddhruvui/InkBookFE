import CopyButton from './CopyButton'

export default function CodeBlock({ block }) {
  return (
    <div className="code-block">
      <div className="code-head no-print">
        <span className="code-lang">{block.payload.lang}</span>
        <CopyButton text={block.payload.text} />
      </div>
      <pre className="code-pre">{block.payload.text}</pre>
    </div>
  )
}
