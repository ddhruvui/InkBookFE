import { Fragment } from 'react'
import useNotebookStore from '../../store/useNotebookStore'
import Icon from '../ui/Icon'
import IconButton from '../ui/IconButton'

// Shared page header: drawer / sidebar toggle, clickable breadcrumb trail,
// right-aligned action slot. crumbs: [{ label, onClick?, color? }]
export default function TopBar({ crumbs = [], children }) {
  const setDrawer = useNotebookStore((s) => s.setDrawer)
  const toggleSide = useNotebookStore((s) => s.toggleSide)
  const sideCollapsed = useNotebookStore((s) => s.sideCollapsed)
  return (
    <header className="nb-toolbar no-print">
      <IconButton icon="menu" label="Open notebook" className="nb-burger" onClick={() => setDrawer(true)} />
      <IconButton
        icon="sidebar"
        label={sideCollapsed ? 'Show sidebar (⌘\\)' : 'Hide sidebar (⌘\\)'}
        className="side-toggle"
        onClick={toggleSide}
      />
      <nav className="crumbs" aria-label="Breadcrumb">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1
          return (
            <Fragment key={i}>
              {i > 0 && <Icon name="chevronRight" size={13} className="crumb-sep" />}
              {c.onClick && !last ? (
                <button type="button" className="crumb" onClick={c.onClick}>
                  {c.color && <span className="crumb-dot" style={{ background: c.color }} />}
                  {c.label}
                </button>
              ) : (
                <span className={`crumb ${last ? 'current' : ''}`} aria-current={last ? 'page' : undefined}>
                  {c.color && <span className="crumb-dot" style={{ background: c.color }} />}
                  {c.label}
                </span>
              )}
            </Fragment>
          )
        })}
      </nav>
      <div className="toolbar-actions">{children}</div>
    </header>
  )
}
