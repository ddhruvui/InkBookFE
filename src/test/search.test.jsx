import { describe, it, expect, vi } from 'vitest'
import { screen, within, fireEvent } from '@testing-library/react'
import { renderApp, currentPath } from './renderApp'
import { IDS, topicPath } from './fixtures'

vi.mock('../api', () => import('./mockApi'))

const palette = () => screen.getByRole('dialog', { name: 'Search notes' })
const openPalette = () => fireEvent.keyDown(window, { key: 'k', metaKey: true })

describe('Search palette', () => {
  it('opens with ⌘K, focuses the input and closes with Esc', async () => {
    const { user } = await renderApp('/')
    openPalette()
    expect(within(palette()).getByRole('combobox')).toHaveFocus()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog', { name: 'Search notes' })).not.toBeInTheDocument()
  })

  it('finds matches in names and bodies and highlights the query', async () => {
    const { user } = await renderApp('/')
    openPalette()
    await user.keyboard('acceleration')
    const options = within(palette()).getAllByRole('option')
    expect(options.map((o) => o.querySelector('.pal-result-title').textContent)).toEqual(["Newton's Laws", 'Kinematics'])
    expect(options[0].querySelector('mark')).toHaveTextContent('acceleration')
    expect(options[0]).toHaveAttribute('aria-selected', 'true')
  })

  it('moves with ↑/↓ and opens the active result with Enter, highlighting matches in the note', async () => {
    const { user } = await renderApp('/')
    openPalette()
    await user.keyboard('acceleration{ArrowDown}')
    expect(within(palette()).getAllByRole('option')[1]).toHaveAttribute('aria-selected', 'true')
    await user.keyboard('{Enter}')
    expect(currentPath()).toBe(topicPath(IDS.physics, IDS.mechanics, IDS.kinematics))
    expect(screen.getByText('Highlighting “acceleration”')).toBeInTheDocument()
    expect(document.querySelector('.text-block mark')).toHaveTextContent('acceleration')
    await user.click(screen.getByRole('button', { name: 'Clear highlight' }))
    expect(document.querySelector('.text-block mark')).toBeNull()
  })

  it('cycles filters with Tab: All → subject → ★ Important → Scans', async () => {
    const { user } = await renderApp(topicPath(IDS.cs, IDS.algorithms, IDS.binary))
    openPalette()
    const tab = (name) => within(palette()).getByRole('tab', { name })
    expect(tab('All')).toHaveAttribute('aria-selected', 'true')
    await user.keyboard('{Tab}')
    expect(tab('Only Computer Science')).toHaveAttribute('aria-selected', 'true')
    expect(within(palette()).getAllByRole('option')).toHaveLength(2)
    await user.keyboard('{Tab}')
    expect(tab('★ Important')).toHaveAttribute('aria-selected', 'true')
    expect(within(palette()).getAllByRole('option')).toHaveLength(2)
    await user.keyboard('{Tab}')
    expect(tab('Scans')).toHaveAttribute('aria-selected', 'true')
    expect(within(palette()).getAllByRole('option').map((o) => o.querySelector('.pal-result-title').textContent)).toEqual(['Wave Basics'])
  })

  it('says when nothing matches', async () => {
    const { user } = await renderApp('/')
    openPalette()
    await user.keyboard('xyzzy')
    expect(within(palette()).getByText('No matches for “xyzzy”.')).toBeInTheDocument()
  })

  it('opens from the sidebar search button too', async () => {
    const { user } = await renderApp('/')
    await user.click(within(screen.getByRole('complementary', { name: 'Notebook' })).getByRole('button', { name: /Search notes/ }))
    expect(palette()).toBeInTheDocument()
  })
})
