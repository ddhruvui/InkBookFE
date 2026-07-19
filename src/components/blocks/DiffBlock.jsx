import CopyButton from './CopyButton'

// Before/after code comparison — danger tint / success tint, each with ⧉ Copy.
export default function DiffBlock({ block }) {
  const { lang, before, after } = block.payload
  return (
    <div className="diff-block">
      <div className="diff-pane">
        <div className="diff-head before no-print">
          <span>BEFORE · {lang}</span>
          <CopyButton text={before} className="copy-btn diff-copy-before" />
        </div>
        <pre className="code-pre">{before}</pre>
      </div>
      <div className="diff-pane after">
        <div className="diff-head after no-print">
          <span>AFTER · {lang}</span>
          <CopyButton text={after} className="copy-btn diff-copy-after" />
        </div>
        <pre className="code-pre diff-pre-after">{after}</pre>
      </div>
    </div>
  )
}
