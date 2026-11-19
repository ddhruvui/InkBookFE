import { vi } from 'vitest'

// Shared API mock — import this file first in every UI test:
//   vi.mock('../api', () => import('./mockApi'))
export const fetchState = vi.fn()
export const putState = vi.fn()
export const uploadFile = vi.fn(async () => ({ url: 'https://ik.imagekit.io/demo/x.png' }))
export const convertScan = vi.fn()
export const summarizeChapter = vi.fn(async () => ({ topics: [] }))
export const absUrl = (u) => u
