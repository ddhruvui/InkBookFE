import { describe, it, expect } from 'vitest'
import { topicSnippet, computeRecents } from '../store/useNotebookStore'
import { makeState } from './fixtures'

const topic = (blocks) => ({ id: 't', name: 'T', blocks })

describe('topicSnippet', () => {
  it('uses prose only, strips markup and wiki-link brackets', () => {
    const t = topic([
      { type: 'math', payload: { text: '\\frac{a}{b}' } },
      { type: 'text', payload: { html: '<b>Bold</b> and [[Other Topic]]' } },
      { type: 'code', payload: { text: 'print(1)' } },
      { type: 'todo', payload: { text: 'Do it', done: false } },
    ])
    expect(topicSnippet(t)).toBe('Bold and Other Topic Do it')
  })

  it('cuts on a word boundary without dangling punctuation', () => {
    const t = topic([{ type: 'text', payload: { html: 'alpha beta, gamma delta epsilon' } }])
    expect(topicSnippet(t, 13)).toBe('alpha beta…')
  })

  it('is empty for topics without prose', () => {
    expect(topicSnippet(topic([{ type: 'code', payload: { text: 'x' } }]))).toBe('')
  })
})

describe('computeRecents', () => {
  it('orders topics by updatedAt, newest first', () => {
    const names = computeRecents(makeState().subjects).map((r) => r.topic.name)
    expect(names).toEqual(["Newton's Laws", 'Kinematics', 'Binary Search', 'Wave Basics'])
  })
})
