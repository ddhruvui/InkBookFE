import { describe, it, expect, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import { renderApp, currentPath } from './renderApp'
import { IDS, chapterPath, topicPath } from './fixtures'
import * as api from '../api'

vi.mock('../api', () => import('./mockApi'))

const open = () => renderApp(chapterPath(IDS.physics, IDS.mechanics))

describe('Chapter page', () => {
  it('shows the chapter header, counts and a breadcrumb', async () => {
    await open()
    expect(screen.getByRole('heading', { level: 1, name: 'Mechanics' })).toBeInTheDocument()
    expect(screen.getByText('2 topics · 2 starred')).toBeInTheDocument()
    const crumbs = screen.getByRole('navigation', { name: 'Breadcrumb' })
    expect(crumbs).toHaveTextContent('Physics')
    expect(within(crumbs).getByText('Mechanics')).toHaveAttribute('aria-current', 'page')
  })

  it('lists topic cards with preview, block count and stars, and opens a topic', async () => {
    const { user } = await open()
    const card = within(screen.getByRole('main')).getByRole('button', { name: /Newton's Laws/ })
    expect(card).toHaveTextContent('3 blocks')
    expect(card.querySelector('.topic-card-stars')).toHaveTextContent('1')
    expect(card).toHaveTextContent('net force equals mass times acceleration')
    await user.click(card)
    expect(currentPath()).toBe(topicPath(IDS.physics, IDS.mechanics, IDS.newton))
  })

  it('has only Summarize / Important / Export / Print chapter actions (+ save status)', async () => {
    await open()
    const names = within(document.querySelector('.nb-toolbar .toolbar-actions')).getAllByRole('button').map((b) => b.getAttribute('aria-label') || b.textContent)
    expect(names).toEqual(['Summarize', 'Important · 2', 'Export PDF', 'Print chapter', 'Saved — save now'])
  })

  it('opens the ★ Important modal with every mark in the chapter and jumps to its topic', async () => {
    const { user } = await open()
    await user.click(screen.getByRole('button', { name: /Important · 2/ }))
    const dialog = screen.getByRole('dialog', { name: 'Important in Mechanics' })
    expect(within(dialog).getByText('net force equals mass times acceleration')).toBeInTheDocument()
    expect(within(dialog).getByText('constant acceleration')).toBeInTheDocument()
    await user.click(within(dialog).getByText('constant acceleration'))
    expect(currentPath()).toBe(topicPath(IDS.physics, IDS.mechanics, IDS.kinematics))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('removes a mark from the modal', async () => {
    const { user } = await open()
    await user.click(screen.getByRole('button', { name: /Important · 2/ }))
    await user.click(screen.getAllByRole('button', { name: 'Remove mark' })[0])
    expect(screen.getByRole('button', { name: /Important · 1/ })).toBeInTheDocument()
  })

  it('streams an AI summary grouped by topic and can close it', async () => {
    api.summarizeChapter.mockResolvedValue({
      topics: [{ name: "Newton's Laws", points: ['F = ma', 'Action and reaction'] }],
    })
    const { user } = await open()
    await user.click(screen.getByRole('button', { name: 'Summarize' }))
    expect(await screen.findByText('Action and reaction', {}, { timeout: 3000 })).toBeInTheDocument()
    expect(screen.getByText('Chapter summary')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Close summary' }))
    expect(screen.queryByText('Chapter summary')).not.toBeInTheDocument()
  })

  it('starts a new topic in this chapter from the dashed card', async () => {
    const { user } = await open()
    await user.click(screen.getByRole('button', { name: /New topic/ }))
    expect(screen.getByRole('textbox', { name: 'New topic in Mechanics' })).toHaveFocus()
  })

  it('redirects unknown chapters home', async () => {
    await renderApp(chapterPath(IDS.physics, 'nope'))
    await vi.waitFor(() => expect(currentPath()).toBe('/'))
  })
})
