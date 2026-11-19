import useNotebookStore from '../../store/useNotebookStore'
import Icon from '../ui/Icon'

export default function CopyButton({ text, className = 'copy-btn', label = 'Copy' }) {
  const toast = useNotebookStore((s) => s.toast)
  const copy = () =>
    navigator.clipboard
      .writeText(text)
      .then(() => toast('⧉ Copied to clipboard'))
      .catch(() => toast('Copy blocked by browser'))
  return (
    <button type="button" className={className} onClick={copy}>
      <Icon name="copy" size={13} /> {label}
    </button>
  )
}
