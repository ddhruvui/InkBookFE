import { describe, it, expect, vi } from 'vitest'
import { screen, within, fireEvent } from '@testing-library/react'
import { renderApp, currentPath } from './renderApp'
import { IDS, chapterPath, topicPath } from './fixtures'
import useNotebookStore from '../store/useNotebookStore'

vi.mock('../api', () => import('./mockApi'))

const tree = () => screen.getByRole('tree', { name: 'Subjects' })

describe('Sidebar', () => {
  it('expands a subject, opens a chapter page from its name, and expands topics with the chevron', async () => {
    const { user } = await renderApp('/')
    await user.click(within(tree()).getByText('Physics'))
    await user.click(within(tree()).getByText('Mechanics'))
    expect(currentPath()).toBe(chapterPath(IDS.physics, IDS.mechanics))
    // Navigating opens the chapter, so its topics are listed.
    expect(within(tree()).getByText("Newton's Laws")).toBeInTheDocument()
    await user.click(within(tree()).getAllByRole('button', { name: 'Collapse chapter' })[0])
    expect(within(tree()).queryByText("Newton's Laws")).not.toBeInTheDocument()
  })

  it('marks the open topic as the current page', async () => {
    await renderApp(topicPath(IDS.physics, IDS.mechanics, IDS.kinematics))
    const row = within(tree()).getByText('Kinematics').closest('[role="treeitem"]')
    expect(row).toHaveAttribute('aria-current', 'page')
    expect(row).toHaveClass('active')
  })

  it('renames a subject from its ⋯ menu', async () => {
    const { user } = await renderApp('/')
    await user.click(within(tree()).getByRole('button', { name: 'Manage “Physics”' }))
    await user.click(screen.getByRole('menuitem', { name: 'Rename' }))
    const input = screen.getByRole('textbox', { name: 'Rename subject' })
    await user.clear(input)
    await user.type(input, 'Physics I{Enter}')
    expect(within(tree()).getByText('Physics I')).toBeInTheDocument()
  })

  it('needs a second click to delete (armed confirm), then removes the node', async () => {
    const { user } = await renderApp('/')
    await user.click(within(tree()).getByRole('button', { name: 'Manage “Empty Subject”' }))
    await user.click(screen.getByRole('menuitem', { name: 'Delete…' }))
    expect(within(tree()).getByText('Empty Subject')).toBeInTheDocument()
    await user.click(screen.getByRole('menuitem', { name: 'Click again to confirm' }))
    expect(within(tree()).queryByText('Empty Subject')).not.toBeInTheDocument()
  })

  it('adds a chapter through the inline form', async () => {
    const { user } = await renderApp('/')
    await user.click(within(tree()).getByRole('button', { name: 'Add chapter to “Computer Science”' }))
    await user.type(screen.getByRole('textbox', { name: 'New chapter in Computer Science' }), 'Graphs{Enter}')
    const cs = useNotebookStore.getState().subjects.find((s) => s._id === IDS.cs)
    expect(cs.chapters.map((c) => c.name)).toEqual(['Algorithms', 'Graphs'])
  })

  it('offers a first-chapter shortcut for an empty subject', async () => {
    const { user } = await renderApp('/')
    await user.click(within(tree()).getByText('Empty Subject'))
    await user.click(within(tree()).getByRole('button', { name: /Add a first chapter/ }))
    expect(screen.getByRole('textbox', { name: 'New chapter in Empty Subject' })).toBeInTheDocument()
  })

  it('cycles the theme system → light → dark and remembers it', async () => {
    const { user } = await renderApp('/')
    const toggle = screen.getByRole('button', { name: 'Theme: match system' })
    await user.click(toggle)
    expect(document.documentElement.dataset.theme).toBe('light')
    await user.click(screen.getByRole('button', { name: 'Theme: light paper' }))
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(localStorage.getItem('inkbook-theme')).toBe('dark')
    await user.click(screen.getByRole('button', { name: 'Theme: dark ink' }))
    expect(document.documentElement.dataset.theme).toBeUndefined()
  })

  it('hides and shows the sidebar with ⌘\\ and the toolbar toggle', async () => {
    const { user, container } = await renderApp('/')
    fireEvent.keyDown(window, { key: '\\', metaKey: true })
    expect(container.querySelector('.nb-app')).toHaveClass('side-collapsed')
    await user.click(screen.getByRole('button', { name: /Show sidebar/ }))
    expect(container.querySelector('.nb-app')).not.toHaveClass('side-collapsed')
  })
})
