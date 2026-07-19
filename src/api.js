import axios from 'axios'

export async function fetchState() {
  const res = await axios.get('/api/state')
  return res.data
}

export async function putState(subjects, important) {
  const res = await axios.put('/api/state', { subjects, important })
  return res.data
}

export async function uploadFile(file) {
  const fd = new FormData()
  fd.append('file', file)
  const res = await axios.post('/api/uploads', fd)
  return res.data
}

// AI endpoints — surface the server's {error} text (503 not-configured, 400, 5xx).
function aiError(err, fallback) {
  return new Error(err?.response?.data?.error || fallback)
}

export async function convertScan(file) {
  const fd = new FormData()
  fd.append('file', file)
  try {
    const res = await axios.post('/api/ai/convert-scan', fd)
    return res.data
  } catch (err) {
    throw aiError(err, 'Scan conversion failed — is the server running?')
  }
}

export async function summarizeChapter(chapterName, topics) {
  try {
    const res = await axios.post('/api/ai/summarize-chapter', { chapterName, topics })
    return res.data
  } catch (err) {
    throw aiError(err, 'Summary failed — is the server running?')
  }
}
