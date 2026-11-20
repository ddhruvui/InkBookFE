import { describe, it, expect, vi } from 'vitest'
import { screen, within, fireEvent } from '@testing-library/react'
import { renderApp, currentPath } from './renderApp'
import { IDS, makeState, chapterPath, subjectPath, subjectTopicPath, topicPath } from './fixtures'
import useNotebookStore, { findSubject, findTopicById } from '../store/useNotebookStore'
import { buildPdfSections, compilePrintHtml } from '../utils/exportHtml'

vi.mock('../api', () => import('./mockApi'))

const tree = () => screen.getByRole('tree', { name: 'Subjects' })
const subjectOf = (id) => findSubject(useNotebookStore.getState().subjects, id)
const crumbs = () => screen.getByRole('navigation', { name: 'Breadcrumb' })

// Topics that sit directly in a subject, outside any chapter.
describe('Subject page', () => {
  it('lists the chapters and the subject’s own topics, and opens either', async () => {
    const { user } = await renderApp(subjectPath(IDS.cs))
    expect(screen.getByRole('heading', { level: 1, name: 'Computer Science' })).toBeInTheDocument()
    expect(screen.getByText('1 chapter · 2 topics')).toBeInTheDocument()
    const main = screen.getByRole('main')
    expect(within(main).getByRole('button', { name: /Algorithms/ })).toHaveTextContent('1 topic')
    await user.click(within(main).getByRole('button', { name: /Cheat Sheet/ }))
    expect(currentPath()).toBe(subjectTopicPath(IDS.cs, IDS.cheatSheet))
  })

  it('opens a chapter from its card', async () => {
    const { user } = await renderApp(subjectPath(IDS.cs))
    await user.click(within(screen.getByRole('main')).getByRole('button', { name: /Algorithms/ }))
    expect(currentPath()).toBe(chapterPath(IDS.cs, IDS.algorithms))
  })

  it('adds a topic straight to the subject from the dashed card', async () => {
    const { user } = await renderApp(subjectPath(IDS.cs))
    await user.click(screen.getByRole('button', { name: /New topic/ }))
    await user.type(screen.getByRole('textbox', { name: 'New topic in Computer Science' }), 'Glossary{Enter}')
    const cs = subjectOf(IDS.cs)
    expect(cs.topics.map((t) => t.name)).toEqual(['Cheat Sheet', 'Glossary'])
    expect(cs.chapters[0].topics.map((t) => t.name)).toEqual(['Binary Search'])
    expect(currentPath()).toBe(subjectTopicPath(IDS.cs, cs.topics[1].id))
  })

  it('is reached from the subject breadcrumb and the dashboard card', async () => {
    const { user } = await renderApp(chapterPath(IDS.physics, IDS.mechanics))
    await user.click(within(crumbs()).getByRole('button', { name: 'Physics' }))
    expect(currentPath()).toBe(subjectPath(IDS.physics))
    await user.click(screen.getByRole('button', { name: 'Home' }))
    const grid = screen.getByRole('heading', { name: 'Subjects' }).closest('section')
    await user.click(within(grid).getByRole('button', { name: 'Computer Science' }))
    expect(currentPath()).toBe(subjectPath(IDS.cs))
  })
})

describe('Topic directly in a subject', () => {
  const open = () => renderApp(subjectTopicPath(IDS.cs, IDS.cheatSheet))

  it('renders with a Subject › Topic breadcrumb and no chapter-only actions', async () => {
    await open()
    expect(screen.getByRole('heading', { level: 1, name: 'Cheat Sheet' })).toBeInTheDocument()
    expect(crumbs()).toHaveTextContent('Computer ScienceCheat Sheet')
    expect(screen.queryByRole('button', { name: 'Summarize this chapter' })).not.toBeInTheDocument()
  })

  it('is listed in the sidebar after the chapters and marked current', async () => {
    await open()
    const rows = within(tree()).getAllByRole('treeitem').map((r) => r.textContent)
    const cs = rows.findIndex((t) => t.startsWith('Computer Science'))
    expect(rows[cs + 1]).toContain('Algorithms')
    expect(rows.slice(cs + 1).find((t) => t.includes('Cheat Sheet'))).toBeTruthy()
    const row = within(tree()).getByText('Cheat Sheet').closest('[role="treeitem"]')
    expect(row).toHaveAttribute('aria-current', 'page')
  })

  it('accepts new blocks', async () => {
    const { user } = await open()
    await user.type(screen.getByRole('textbox', { name: 'Write a new paragraph' }), 'Memorise it{Enter}')
    const { chapter, topic } = findTopicById(useNotebookStore.getState().subjects, IDS.cheatSheet)
    expect(chapter).toBeNull()
    expect(topic.blocks.at(-1)).toMatchObject({ type: 'text', payload: { html: 'Memorise it' } })
  })

  it('can be duplicated, moved and deleted from its ⋯ menu', async () => {
    const { user } = await renderApp('/')
    await user.click(within(tree()).getByText('Computer Science'))
    const manage = () => within(tree()).getByRole('button', { name: 'Manage “Cheat Sheet”' })
    await user.click(manage())
    await user.click(screen.getByRole('menuitem', { name: 'Duplicate' }))
    expect(subjectOf(IDS.cs).topics.map((t) => t.name)).toEqual(['Cheat Sheet', 'Cheat Sheet (copy)'])
    await user.click(manage())
    await user.click(screen.getByRole('menuitem', { name: 'Move down' }))
    expect(subjectOf(IDS.cs).topics.map((t) => t.name)).toEqual(['Cheat Sheet (copy)', 'Cheat Sheet'])
    // The menu stays open after a move.
    await user.click(screen.getByRole('menuitem', { name: 'Delete…' }))
    await user.click(screen.getByRole('menuitem', { name: 'Click again to confirm' }))
    expect(subjectOf(IDS.cs).topics.map((t) => t.name)).toEqual(['Cheat Sheet (copy)'])
  })

  it('shows up in search with the subject as its path and opens from there', async () => {
    const { user } = await renderApp('/')
    fireEvent.keyDown(window, { key: 'k', metaKey: true })
    await user.keyboard('hash map')
    const options = within(screen.getByRole('dialog', { name: 'Search notes' })).getAllByRole('option')
    expect(options).toHaveLength(1)
    expect(options[0]).toHaveTextContent('Computer Science')
    await user.keyboard('{Enter}')
    expect(currentPath()).toBe(subjectTopicPath(IDS.cs, IDS.cheatSheet))
  })

  it('links back from [[wiki links]] in either direction', async () => {
    const { user } = await renderApp(topicPath(IDS.cs, IDS.algorithms, IDS.binary))
    const panel = screen.getByText('Linked from').closest('section')
    await user.click(within(panel).getByRole('button', { name: /Cheat Sheet/ }))
    expect(currentPath()).toBe(subjectTopicPath(IDS.cs, IDS.cheatSheet))
  })

  it('offers This topic and Entire subject (no chapter) in the export modal', async () => {
    const { user } = await open()
    await user.click(screen.getByRole('button', { name: 'Export PDF' }))
    const scopes = within(screen.getByRole('radiogroup', { name: 'Export scope' })).getAllByRole('radio')
    expect(scopes.map((r) => r.querySelector('.scope-label').textContent)).toEqual(['This topic', 'Entire subject'])
  })
})

describe('Sidebar — adding topics to a subject', () => {
  it('adds a topic to a subject from its row action', async () => {
    const { user } = await renderApp('/')
    await user.click(within(tree()).getByRole('button', { name: 'Add topic to “Physics”' }))
    await user.type(screen.getByRole('textbox', { name: 'New topic in Physics' }), 'Formula Sheet{Enter}')
    const physics = subjectOf(IDS.physics)
    expect(physics.topics.map((t) => t.name)).toEqual(['Formula Sheet'])
    expect(currentPath()).toBe(subjectTopicPath(IDS.physics, physics.topics[0].id))
    expect(within(tree()).getByText('Formula Sheet')).toBeInTheDocument()
  })

  it('offers a topic shortcut for an empty subject', async () => {
    const { user } = await renderApp('/')
    await user.click(within(tree()).getByText('Empty Subject'))
    await user.click(within(tree()).getByRole('button', { name: /Add a topic/ }))
    await user.type(screen.getByRole('textbox', { name: 'New topic in Empty Subject' }), 'Notes{Enter}')
    expect(subjectOf(IDS.empty).topics.map((t) => t.name)).toEqual(['Notes'])
  })

  it('opens the subject overview from the ⋯ menu', async () => {
    const { user } = await renderApp('/')
    await user.click(within(tree()).getByRole('button', { name: 'Manage “Physics”' }))
    await user.click(screen.getByRole('menuitem', { name: 'Open overview' }))
    expect(currentPath()).toBe(subjectPath(IDS.physics))
  })
})

describe('Export of a subject with its own topics', () => {
  it('puts them after the chapters, behind a Topics title page', () => {
    const subject = makeState().subjects.find((s) => s._id === IDS.cs)
    const { sections } = buildPdfSections('subject', { subject })
    // subject title, chapter title, Binary Search, Topics title, Cheat Sheet
    expect(sections).toHaveLength(5)
    expect(sections[3]).toContain('topics not in a chapter')
    expect(sections[4]).toContain('Cheat Sheet')
  })

  it('includes them in the printed subject', () => {
    const html = compilePrintHtml(makeState().subjects, 'subject', { subjectId: IDS.cs })
    expect(html.indexOf('Binary Search')).toBeLessThan(html.indexOf('Cheat Sheet'))
  })
})
