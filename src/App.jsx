import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/AppShell'
import Dashboard from './components/dashboard/Dashboard'
import ChapterPage from './components/chapter/ChapterPage'
import NotePage from './components/note/NotePage'

// Route table, separate from the router so tests can mount it in a MemoryRouter.
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/subject/:s/chapter/:c" element={<ChapterPage />} />
        <Route path="/s/:s/c/:c/t/:t" element={<NotePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
