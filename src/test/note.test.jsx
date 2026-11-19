import { describe, it, expect, vi } from 'vitest'
import { screen, within, fireEvent, act } from '@testing-library/react'
import { renderApp, currentPath } from './renderApp'
import { IDS, chapterPath, topicPath } from './fixtures'
import useNotebookStore, { findTopicById } from '../store/useNotebookStore'
import * as api from '../api'

vi.mock('../api', () => import('./mockApi'))

const openNewton = () => renderApp(topicPath(IDS.physics, IDS.mechanics, IDS.newton))
const blocksOf = (id) => findTopicById(useNotebookStore.getState().subjects, id).topic.blocks

describe('Note page', () => {
  it('renders the title, breadcrumb and every block', async () => {
    const { container } = await openNewton()
    expect(screen.getByRole('heading', { level: 1, name: "Newton's Laws" })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toHaveTextContent("PhysicsMechanicsNewton's Laws")
    expect(container.querySelectorAll('.block-frame')).toHaveLength(3)
    // ★ mark underline + highlight survive in the text block
    expect(container.querySelector('.imp-underline')).toHaveTextContent('net force equals mass times acceleration')
    expect(screen.getByRole('checkbox', { name: 'Solve the problem set' })).toHaveAttribute('aria-checked', 'false')
  })

  it('navigates to the chapter from the breadcrumb', async () => {
    const { user } = await openNewton()
    await user.click(within(screen.getByRole('navigation', { name: 'Breadcrumb' })).getByRole('button', { name: 'Mechanics' }))
    expect(currentPath()).toBe(chapterPath(IDS.physics, IDS.mechanics))
  })

  it('renames the topic inline (Enter saves, Esc cancels)', async () => {
    const { user } = await openNewton()
    await user.click(screen.getByRole('button', { name: 'Rename topic' }))
    const input = screen.getByRole('textbox', { name: 'Topic title' })
    await user.clear(input)
    await user.type(input, 'Laws of Motion{Enter}')
    expect(screen.getByRole('heading', { level: 1, name: 'Laws of Motion' })).toBeInTheDocument()
    await user.dblClick(screen.getByRole('heading', { level: 1 }))
    await user.type(screen.getByRole('textbox', { name: 'Topic title' }), 'zzz{Escape}')
    expect(screen.getByRole('heading', { level: 1, name: 'Laws of Motion' })).toBeInTheDocument()
  })

  it('adds a paragraph from the composer with Enter (Shift+Enter keeps typing)', async () => {
    const { user } = await openNewton()
    const composer = screen.getByRole('textbox', { name: 'Write a new paragraph' })
    await user.type(composer, 'Line one{Shift>}{Enter}{/Shift}line two')
    expect(screen.getByText(/Enter to add/)).toBeInTheDocument()
    await user.keyboard('{Enter}')
    expect(composer).toHaveValue('')
    const last = blocksOf(IDS.newton).at(-1)
    expect(last).toMatchObject({ type: 'text', payload: { html: 'Line one\nline two' } })
  })

  it('inserts a code block from the Add block menu', async () => {
    const { user } = await openNewton()
    await user.click(screen.getByRole('button', { name: /Add block/ }))
    const menu = screen.getByRole('menu', { name: 'Add block' })
    expect(within(menu).getAllByRole('menuitem').map((m) => m.querySelector('.insert-label').textContent)).toEqual([
      'Paragraph', 'Code', 'Before / after', 'Math', 'To-do', 'Table', 'Image',
    ])
    await user.click(within(menu).getByRole('menuitem', { name: /Code/ }))
    await user.type(screen.getByPlaceholderText('# code'), 'print(1)')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(blocksOf(IDS.newton).at(-1)).toMatchObject({ type: 'code', payload: { text: 'print(1)' } })
  })

  it('edits a text block with the format toolbar', async () => {
    const { user, container } = await openNewton()
    await user.dblClick(container.querySelector('.text-block'))
    expect(screen.getByText('Paragraph')).toBeInTheDocument()
    const ta = container.querySelector('.editor-textarea')
    await user.clear(ta)
    await user.type(ta, 'hello')
    ta.setSelectionRange(0, 5)
    await user.click(screen.getByRole('button', { name: 'Bold selection' }))
    expect(ta).toHaveValue('<b>hello</b>')
    await user.keyboard('{Meta>}{Enter}{/Meta}')
    expect(blocksOf(IDS.newton)[0].payload.html).toBe('<b>hello</b>')
  })

  it('reorders, deletes and undoes block changes', async () => {
    const { user } = await openNewton()
    const undo = screen.getByRole('button', { name: 'Undo (⌘Z)' })
    expect(undo).toBeDisabled()
    await user.click(screen.getAllByRole('button', { name: 'Move down' })[0])
    expect(blocksOf(IDS.newton).map((b) => b.id)).toEqual(['b-n2', 'b-n1', 'b-n3'])
    await user.click(screen.getAllByRole('button', { name: 'Delete' })[2])
    expect(blocksOf(IDS.newton)).toHaveLength(2)
    expect(undo).toBeEnabled()
    await user.click(undo)
    expect(blocksOf(IDS.newton)).toHaveLength(3)
  })

  it('toggles a to-do', async () => {
    const { user } = await openNewton()
    await user.click(screen.getByRole('checkbox', { name: 'Solve the problem set' }))
    expect(screen.getByRole('checkbox', { name: 'Solve the problem set' })).toHaveAttribute('aria-checked', 'true')
  })

  it('shows save status: Saved → Unsaved after an edit → Saved after ⌘S', async () => {
    const { user } = await openNewton()
    expect(screen.getByRole('button', { name: 'Saved — save now' })).toBeInTheDocument()
    await user.click(screen.getByRole('checkbox', { name: 'Solve the problem set' }))
    expect(screen.getByRole('button', { name: 'Unsaved — save now' })).toBeInTheDocument()
    await act(async () => {
      fireEvent.keyDown(window, { key: 's', metaKey: true })
    })
    await vi.waitFor(() => expect(api.putState).toHaveBeenCalled())
    expect(api.putState.mock.calls[0][2]).toBe(7) // sends the loaded version
    expect(await screen.findByRole('button', { name: 'Saved — save now' })).toBeInTheDocument()
    expect(await screen.findByRole('status')).toHaveTextContent('All changes saved')
  })

  it('follows a [[wiki-link]] and shows the backlink on the target', async () => {
    const { container } = await openNewton()
    fireEvent.click(container.querySelector('[data-link="Kinematics"]'))
    expect(currentPath()).toBe(topicPath(IDS.physics, IDS.mechanics, IDS.kinematics))
    const backlinks = screen.getByText('Linked from').closest('section')
    expect(within(backlinks).getByRole('button', { name: /Newton's Laws/ })).toBeInTheDocument()
  })

  it('offers ★ Mark important for a text selection and stores it', async () => {
    const { user, container } = await openNewton()
    const textEl = container.querySelector('.text-block')
    const range = document.createRange()
    range.selectNodeContents(textEl.querySelector('b'))
    window.getSelection().removeAllRanges()
    window.getSelection().addRange(range)
    range.getBoundingClientRect = () => ({ top: 200, bottom: 220, left: 300, width: 80, height: 20 })
    fireEvent.mouseUp(container.querySelector('.nb-scroll'))
    const buttons = await screen.findAllByRole('button', { name: /Mark important/ })
    await user.click(buttons[0])
    const marks = useNotebookStore.getState().important.filter((m) => m.topicId === IDS.newton)
    expect(marks.map((m) => m.text)).toContain('Second law:')
  })

  it('opens the export modal scoped to this topic', async () => {
    const { user } = await openNewton()
    await user.click(screen.getByRole('button', { name: 'Export PDF' }))
    const dialog = screen.getByRole('dialog', { name: 'Export as PDF' })
    const radios = within(dialog).getAllByRole('radio')
    expect(radios.map((r) => r.querySelector('.scope-label').textContent)).toEqual(['This topic', 'Whole chapter', 'Entire subject'])
    expect(radios[0]).toHaveAttribute('aria-checked', 'true')
    await user.click(radios[1])
    expect(radios[1]).toHaveAttribute('aria-checked', 'true')
    await user.click(within(dialog).getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens the scan wizard pre-targeted at this topic', async () => {
    const { user } = await openNewton()
    await user.click(screen.getByRole('button', { name: 'Scan' }))
    const dialog = screen.getByRole('dialog', { name: 'Scan handwritten notes' })
    expect(within(dialog).getByText('Drop a scan or photo here')).toBeInTheDocument()
    expect(within(dialog).getByText('Step 1 of 2 · Upload a photo')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders code, link and table blocks on other topics', async () => {
    await renderApp(topicPath(IDS.cs, IDS.algorithms, IDS.binary))
    expect(screen.getByText('python')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Wikipedia/ })).toHaveAttribute('href', 'https://en.wikipedia.org/wiki/Binary_search')
    expect(screen.getByRole('link', { name: /Wikipedia/ })).toHaveTextContent('en.wikipedia.org')
  })
})
