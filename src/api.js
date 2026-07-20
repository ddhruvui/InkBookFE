import axios from 'axios'

// Backend base URL. Empty in dev — Vite proxies /api and /uploads to the
// server (see vite.config.js). In production (Render) set VITE_API_URL.
const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')

const http = axios.create({ baseURL: BASE_URL })

// Server-relative paths (/uploads/…) need the base prepended when the
// frontend is served from a different origin than the server.
export function absUrl(url) {
  if (!url) return url
  return /^https?:\/\//i.test(url) ? url : BASE_URL + url
}

export async function fetchState() {
  const res = await http.get('/api/state')
  return res.data
}

export async function putState(subjects, important) {
  const res = await http.put('/api/state', { subjects, important })
  return res.data
}

export async function uploadFile(file) {
  const fd = new FormData()
  fd.append('file', file)
  const res = await http.post('/api/uploads', fd)
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
    const res = await http.post('/api/ai/convert-scan', fd)
    return res.data
  } catch (err) {
    throw aiError(err, 'Scan conversion failed — is the server running?')
  }
}

export async function summarizeChapter(chapterName, topics) {
  try {
    const res = await http.post('/api/ai/summarize-chapter', { chapterName, topics })
    return res.data
  } catch (err) {
    throw aiError(err, 'Summary failed — is the server running?')
  }
}
