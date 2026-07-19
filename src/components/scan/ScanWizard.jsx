import { useEffect, useRef, useState } from 'react'
import useNotebookStore, { findSubject } from '../../store/useNotebookStore'
import { useNav } from '../../hooks/useNav'
import { convertScan, uploadFile } from '../../api'
import { sanitizeHtml, sanitizeSvg, stripTags } from '../../utils/richtext'
import Modal from '../ui/Modal'

// Staged progress texts (prototype: ~1s apart, last one loops until the API resolves).
const STATUS_MSGS = ['Reading handwriting…', 'Transcribing text…', 'Redrawing diagram as vector…']

const MAX_BYTES = 10 * 1024 * 1024

const escapeHtml = (s) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Sanitized model HTML body → friendly editable plain text (paragraph breaks kept).
function htmlToPlain(html) {
  return stripTags(
    sanitizeHtml(html)
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>\s*<p[^>]*>/gi, '\n\n')
      .replace(/<\/?p[^>]*>/gi, '')
  ).trim()
}

// Edited plain text back to <p>…</p> HTML (escaped, so it is inert by construction).
function plainToHtml(text) {
  return String(text ?? '')
    .trim()
    .split(/\n{2,}/)
    .filter((p) => p.trim())
    .map((p) => '<p>' + escapeHtml(p).replace(/\n/g, '<br>') + '</p>')
    .join('')
}

// 📷 Scan handwritten notes — modal wizard (README §6). Mounted only while the
// store's scanOpen destination is set, so every open starts a fresh wizard.
export default function ScanWizard() {
  const scanOpen = useNotebookStore((s) => s.scanOpen)
  if (!scanOpen) return null
  return <ScanWizardModal dest={scanOpen} />
}

function ScanWizardModal({ dest }) {
  const subjects = useNotebookStore((s) => s.subjects)
  const store = useNotebookStore.getState()
  const { goTopic } = useNav()

  const [stage, setStage] = useState('upload') // upload | review
  const [drag, setDrag] = useState(false)
  const [imgUrl, setImgUrl] = useState('')
  const [converting, setConverting] = useState(false)
  const [statusIdx, setStatusIdx] = useState(0)
  const [fields, setFields] = useState(null) // {title, body, formula, svg, caption, tip, transcript}
  const [keepOrig, setKeepOrig] = useState(true)
  const [saving, setSaving] = useState(false)

  // Destination (pre-targeted from the note toolbar 📷; falls back to first nodes).
  const [destS, setDestS] = useState(dest.subjectId || subjects[0]?._id || '')
  const [destC, setDestC] = useState(dest.chapterId || '')
  const [destT, setDestT] = useState(dest.topicId || 'new')
  const [destName, setDestName] = useState('')

  const subject = findSubject(subjects, destS) || subjects[0] || null
  const chapter = subject
    ? subject.chapters.find((c) => c.id === destC) || subject.chapters[0] || null
    : null
  const topic =
    chapter && destT !== 'new' ? chapter.topics.find((t) => t.id === destT) || null : null

  const fileRef = useRef(null)
  const scanFileRef = useRef(null) // original File — only uploaded on save when keepOrig
  const timersRef = useRef([])
  const aliveRef = useRef(true)
  const urlRef = useRef('')

  useEffect(() => {
    aliveRef.current = true
    const timers = timersRef.current
    return () => {
      aliveRef.current = false
      timers.forEach(clearTimeout)
      if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    }
  }, [])

  const startConvert = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return store.toast('Please choose an image file')
    if (file.size > MAX_BYTES) return store.toast('Image is too large — 10MB max')
    const url = URL.createObjectURL(file)
    urlRef.current = url
    scanFileRef.current = file
    setImgUrl(url)
    setStage('review')
    setConverting(true)
    setStatusIdx(0)
    timersRef.current.push(
      setTimeout(() => setStatusIdx(1), 1000),
      setTimeout(() => setStatusIdx(2), 2000)
    )
    convertScan(file)
      .then((res) => {
        if (!aliveRef.current) return
        setConverting(false)
        setFields({
          title: res.title || '',
          body: htmlToPlain(res.body || ''),
          formula: res.formula || '',
          svg: sanitizeSvg(res.diagram?.svg || ''),
          caption: res.diagram?.caption || '',
          tip: res.tip || '',
          transcript: res.transcript || '',
        })
        setDestName(res.title || 'Scanned note')
      })
      .catch((err) => {
        if (!aliveRef.current) return
        store.toast(err.message)
        // Back to the dropzone so the user can retry with another photo.
        setConverting(false)
        setStage('upload')
        setImgUrl('')
        if (urlRef.current) {
          URL.revokeObjectURL(urlRef.current)
          urlRef.current = ''
        }
      })
  }

  const setField = (k) => (e) => setFields((f) => ({ ...f, [k]: e.target.value }))

  const noDestination = !subject
    ? 'Create a subject first — the wizard needs somewhere to save.'
    : !chapter
      ? `Add a chapter to ${subject.name} first.`
      : ''

  const onSave = async () => {
    if (converting || saving || !fields || noDestination) return
    const blocks = []
    if (fields.body.trim()) blocks.push({ type: 'text', payload: { html: plainToHtml(fields.body) } })
    if (fields.formula.trim()) blocks.push({ type: 'math', payload: { text: fields.formula.trim() } })
    const svg = sanitizeSvg(fields.svg)
    if (svg.trim()) blocks.push({ type: 'diagram', payload: { svg, caption: fields.caption.trim() } })
    if (fields.tip.trim())
      blocks.push({ type: 'text', payload: { html: `<p><b>Tip:</b> ${escapeHtml(fields.tip.trim())}</p>` } })
    if (keepOrig && scanFileRef.current) {
      // The original is only uploaded here, once the user has chosen to keep it.
      setSaving(true)
      try {
        const stored = await uploadFile(scanFileRef.current)
        blocks.push({ type: 'scan', payload: { imageUrl: stored.url, transcript: fields.transcript } })
      } catch (err) {
        store.toast(err?.response?.data?.error || 'Could not store the original scan — try again or uncheck “Keep original scan”')
        return
      } finally {
        if (aliveRef.current) setSaving(false)
      }
      if (!aliveRef.current) return
    }
    if (!blocks.length) return store.toast('Nothing to save — all fields are empty')
    const result = store.saveScanToTopic({
      subjectId: subject._id,
      chapterId: chapter.id,
      topicId: topic ? topic.id : null,
      newName: destName.trim() || fields.title.trim() || 'Scanned note',
      blocks,
    })
    if (!result) return
    store.closeScan()
    goTopic(result.subjectId, result.chapterId, result.topicId)
    store.toast(`✓ Saved to ${subject.name} › ${chapter.name}`)
  }

  return (
    <Modal onClose={() => store.closeScan()} cardClassName="scanw-card">
      <div className="scanw-head">
        <div className="scanw-title">📷 Scan handwritten notes</div>
        <span className="scanw-close" onClick={() => store.closeScan()}>✕</span>
      </div>

      {stage === 'upload' && (
        <div className="scanw-stage1">
          <div
            className={`scanw-drop ${drag ? 'drag' : ''}`}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setDrag(true)
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDrag(false)
              startConvert(e.dataTransfer.files?.[0])
            }}
          >
            <div className="scanw-drop-icon">📄</div>
            <div className="scanw-drop-title">Drop a scan or photo here</div>
            <div className="scanw-drop-sub">…or click to pick an image (jpg / png / heic)</div>
          </div>
          <div className="scanw-helper">
            AI transcribes the text and redraws diagrams as clean vectors. You review and fix before saving.
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              startConvert(e.target.files?.[0])
              e.target.value = ''
            }}
          />
        </div>
      )}

      {stage === 'review' && (
        <>
          <div className="scanw-body">
            <div className="scanw-left">
              <div className="scanw-col-label">ORIGINAL SCAN</div>
              <div className="scanw-original">
                <img src={imgUrl} alt="Original scan" />
              </div>
            </div>
            <div className="scanw-right">
              <div className="scanw-col-label">✦ AI CONVERTED — CLICK TEXT TO FIX</div>
              {converting && (
                <div className="scanw-progress">
                  <div className="scanw-spinner" />
                  <div className="scanw-status">{STATUS_MSGS[statusIdx]}</div>
                </div>
              )}
              {!converting && fields && (
                <div className="scanw-form">
                  <input className="scanw-title-input" value={fields.title} onChange={setField('title')} />
                  <textarea
                    className="scanw-body-input"
                    rows={4}
                    value={fields.body}
                    onChange={setField('body')}
                  />
                  <input className="scanw-formula-input" value={fields.formula} onChange={setField('formula')} />
                  {fields.svg.trim() && (
                    <div className="scanw-diagram">
                      <div dangerouslySetInnerHTML={{ __html: sanitizeSvg(fields.svg) }} />
                      <input className="scanw-caption-input" value={fields.caption} onChange={setField('caption')} />
                    </div>
                  )}
                  <input className="scanw-tip-input" value={fields.tip} onChange={setField('tip')} />
                  <label className="scanw-keep" onClick={() => setKeepOrig((v) => !v)}>
                    <span className={`scanw-keep-box ${keepOrig ? 'on' : ''}`}>{keepOrig ? '✓' : ''}</span>
                    Keep original scan attached below the note
                  </label>
                </div>
              )}
            </div>
          </div>
          <div className="scanw-footer">
            <div className="scanw-saveto">SAVE TO</div>
            {noDestination ? (
              <span className="scanw-empty">{noDestination}</span>
            ) : (
              <>
                <select
                  className="scanw-select"
                  value={subject._id}
                  onChange={(e) => {
                    setDestS(e.target.value)
                    setDestC(findSubject(subjects, e.target.value)?.chapters[0]?.id || '')
                    setDestT('new')
                  }}
                >
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
                <select
                  className="scanw-select"
                  value={chapter.id}
                  onChange={(e) => {
                    setDestC(e.target.value)
                    setDestT('new')
                  }}
                >
                  {subject.chapters.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <select
                  className="scanw-select"
                  value={topic ? topic.id : 'new'}
                  onChange={(e) => setDestT(e.target.value)}
                >
                  <option value="new">＋ New topic</option>
                  {chapter.topics.map((t) => (
                    <option key={t.id} value={t.id}>Append to: {t.name}</option>
                  ))}
                </select>
                {!topic && (
                  <input
                    className="scanw-newname"
                    placeholder="New topic name…"
                    value={destName}
                    onChange={(e) => setDestName(e.target.value)}
                  />
                )}
              </>
            )}
            <span style={{ flex: 1 }} />
            <button className="modal-btn-ghost" onClick={() => store.closeScan()}>Discard</button>
            <button
              className="modal-btn-primary"
              disabled={converting || saving || !!noDestination}
              onClick={onSave}
            >
              {saving ? 'Saving…' : 'Save note'}
            </button>
          </div>
        </>
      )}
    </Modal>
  )
}
