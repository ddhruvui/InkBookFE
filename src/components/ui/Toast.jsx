import useNotebookStore from '../../store/useNotebookStore'

export default function Toast() {
  const toastOn = useNotebookStore((s) => s.toastOn)
  const toastMsg = useNotebookStore((s) => s.toastMsg)
  if (!toastOn) return null
  return <div className="nb-toast no-print">{toastMsg}</div>
}
