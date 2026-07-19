import useNotebookStore from '../../store/useNotebookStore'

export default function CopyButton({ text, className = 'copy-btn' }) {
  const toast = useNotebookStore((s) => s.toast)
  const copy = () =>
    navigator.clipboard
      .writeText(text)
      .then(() => toast('⧉ Copied to clipboard'))
      .catch(() => toast('Copy blocked by browser'))
  return (
    <button className={className} onClick={copy}>
      ⧉ Copy
    </button>
  )
}
