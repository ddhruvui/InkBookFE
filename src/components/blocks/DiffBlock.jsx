import CopyButton from './CopyButton'

// Before/after code comparison — danger tint / success tint, each with Copy.
export default function DiffBlock({ block }) {
  const { lang, before, after } = block.payload
  return (
    <div className="diff-block">
      <div className="diff-pane before">
        <div className="diff-head before no-print">
          <span>Before · {lang}</span>
          <CopyButton text={before} className="copy-btn diff-copy" />
        </div>
        <pre className="code-pre">{before}</pre>
      </div>
      <div className="diff-pane after">
        <div className="diff-head after no-print">
          <span>After · {lang}</span>
          <CopyButton text={after} className="copy-btn diff-copy" />
        </div>
        <pre className="code-pre diff-pre-after">{after}</pre>
      </div>
    </div>
  )
}
