import { useState } from 'react'
import useNotebookStore from '../../store/useNotebookStore'
import { uploadFile, absUrl } from '../../api'
import Icon from '../ui/Icon'

// Dashed dropzone when empty; contained image + caption when filled.
// Upload posts to /api/uploads and stores the returned URL.
export default function ImageBlock({ block, topicId }) {
  const [uploading, setUploading] = useState(false)
  const store = useNotebookStore.getState()
  const { url, caption } = block.payload

  const onFile = async (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await uploadFile(file)
      store.setImageUrl(topicId, block.id, res.url)
    } catch {
      store.toast('Upload failed — is the server running?')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="image-block">
      {url ? (
        <img className="image-view" src={absUrl(url)} alt={caption || 'Image'} loading="lazy" />
      ) : (
        <label className="image-dropzone">
          <input type="file" accept="image/*" onChange={onFile} style={{ display: 'none' }} />
          <div className="image-drop-icon"><Icon name={uploading ? 'upload' : 'image'} size={26} /></div>
          <div className="image-drop-title">{uploading ? 'Uploading…' : 'Click to upload an image'}</div>
          <div className="image-drop-sub">screenshot, photo, figure…</div>
        </label>
      )}
      {caption && <div className="block-caption">{caption}</div>}
    </div>
  )
}
