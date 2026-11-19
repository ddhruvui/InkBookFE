/* oxlint-disable react/only-export-components -- test helper, never hot-reloaded */
import { vi, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { AppRoutes } from '../App'
import useNotebookStore from '../store/useNotebookStore'
import * as api from '../api'
import { makeState } from './fixtures'

const INITIAL = useNotebookStore.getState()

function LocationProbe() {
  const loc = useLocation()
  return <div data-testid="location" data-path={loc.pathname} hidden />
}

// Mounts the real app at `path` with a fresh store and a mocked API.
// `state` overrides the fixture notebook (e.g. an empty one).
export async function renderApp(path = '/', { state = makeState() } = {}) {
  useNotebookStore.setState({ ...INITIAL, subjects: [], important: [], undoStack: [] }, true)
  api.fetchState.mockResolvedValue(structuredClone(state))
  api.putState.mockImplementation(async (_s, _i, base) => ({ ok: true, savedAt: new Date().toISOString(), version: (base || 0) + 1 }))
  const user = userEvent.setup()
  const utils = render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
      <LocationProbe />
    </MemoryRouter>
  )
  await screen.findByRole('tree', { name: 'Subjects' })
  // Wait for the notebook to load.
  await vi.waitFor(() => expect(useNotebookStore.getState().loaded).toBe(true))
  return { user, ...utils }
}

export const currentPath = () => screen.getByTestId('location').dataset.path
