import { describe, it, expect, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import { renderApp, currentPath } from './renderApp'
import { IDS, chapterPath, topicPath } from './fixtures'

vi.mock('../api', () => import('./mockApi'))

describe('Dashboard', () => {
  it('shows notebook totals and quick actions, with no greeting or important-marks section', async () => {
    await renderApp('/')
    expect(screen.getByRole('heading', { name: 'Pick up where you left off' })).toBeInTheDocument()
    expect(screen.getByText('3 subjects · 3 chapters · 5 topics')).toBeInTheDocument()
    expect(within(screen.getByRole('main')).getByRole('button', { name: /Search notes/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Scan a page/ })).toBeInTheDocument()
    expect(screen.queryByText(/good (morning|afternoon|evening)/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/marked important/i)).not.toBeInTheDocument()
  })

  it('lists the 4 most recent topics newest first, with path and prose preview', async () => {
    await renderApp('/')
    const section = screen.getByRole('heading', { name: 'Recent' }).closest('section')
    const cards = within(section).getAllByRole('button')
    expect(cards).toHaveLength(4)
    expect(cards.map((c) => c.querySelector('.recent-title').textContent)).toEqual([
      "Newton's Laws",
      'Kinematics',
      'Binary Search',
      'Wave Basics',
    ])
    expect(cards[0]).toHaveTextContent('Physics › Mechanics')
    // Wiki-link brackets and markup are stripped from the preview; LaTeX is excluded.
    expect(cards[0].querySelector('.recent-snippet').textContent).toContain('See Kinematics')
    expect(cards[0].querySelector('.recent-snippet').textContent).not.toContain('F = ma')
  })

  it('opens a topic from a recent card', async () => {
    const { user } = await renderApp('/')
    await user.click(screen.getByRole('button', { name: /Binary Search/ }))
    expect(currentPath()).toBe(topicPath(IDS.cs, IDS.algorithms, IDS.binary))
    expect(await screen.findByRole('heading', { level: 1, name: 'Binary Search' })).toBeInTheDocument()
  })

  it('shows every subject with counts and opens a chapter from its chip', async () => {
    const { user } = await renderApp('/')
    const grid = screen.getByRole('heading', { name: 'Subjects' }).closest('section')
    expect(within(grid).getByText('2 chapters · 3 topics')).toBeInTheDocument()
    expect(within(grid).getByText('1 chapter · 2 topics')).toBeInTheDocument()
    expect(within(grid).getByText('No chapters or topics yet')).toBeInTheDocument()
    await user.click(within(grid).getByRole('button', { name: /Waves/ }))
    expect(currentPath()).toBe(chapterPath(IDS.physics, IDS.waves))
  })

  it('shows an empty state for a brand-new notebook and starts a subject from it', async () => {
    const { user } = await renderApp('/', { state: { version: 0, subjects: [], important: [] } })
    expect(screen.getByText('No notes yet')).toBeInTheDocument()
    await user.click(screen.getAllByRole('button', { name: /New subject/ }).at(-1))
    expect(screen.getByRole('textbox', { name: 'New subject' })).toHaveFocus()
  })
})
