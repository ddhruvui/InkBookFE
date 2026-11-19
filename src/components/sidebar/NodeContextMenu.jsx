import useNotebookStore, { SWATCH_COLORS } from '../../store/useNotebookStore'
import { useNav } from '../../hooks/useNav'
import Icon from '../ui/Icon'
import ColorSwatchRow from './ColorSwatchRow'

function Item({ icon, children, onClick, className = '' }) {
  return (
    <button
      type="button"
      role="menuitem"
      className={`menu-item ${className}`}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      <Icon name={icon} size={15} className="menu-icon" />
      <span>{children}</span>
    </button>
  )
}

// Inline dropdown card for subject / chapter / topic ⋯ menus.
// items: rename + (chapter: important/summarize) + (subject/chapter: export/print)
// + (subject: colors) + duplicate + move up/down + armed delete confirm.
export default function NodeContextMenu({ type, ids, name, color }) {
  const menu = useNotebookStore((s) => s.menu)
  const deleteArm = useNotebookStore((s) => s.deleteArm)
  const renameVal = useNotebookStore((s) => s.renameVal)
  const store = useNotebookStore.getState()
  const { goChapter } = useNav()

  const onRenameKey = (e) => {
    if (e.key === 'Enter') store.applyRename()
    if (e.key === 'Escape') store.closeMenus()
  }
  const stop = (fn) => (e) => {
    e.stopPropagation()
    fn()
  }
  const scopeCtx = {
    subjectId: ids.subjectId,
    chapterId: type === 'subject' ? null : ids.chapterId,
  }

  return (
    <div className={`node-menu ${type}`} role="menu" onClick={(e) => e.stopPropagation()}>
      {menu?.renaming ? (
        <div className="menu-rename">
          <input
            autoFocus
            className="menu-input"
            aria-label={`Rename ${type}`}
            value={renameVal}
            onChange={(e) => store.setRenameVal(e.target.value)}
            onKeyDown={onRenameKey}
            onFocus={(e) => e.target.select()}
          />
          <div className="menu-btn-row">
            <button type="button" className="mini-btn ghost" onClick={stop(() => store.closeMenus())}>Cancel</button>
            <button type="button" className="mini-btn primary" onClick={stop(() => store.applyRename())}>Save</button>
          </div>
        </div>
      ) : (
        <>
          <Item icon="pencil" onClick={() => store.startRename(name)}>Rename</Item>
          {type === 'chapter' && (
            <>
              <Item
                icon="star"
                onClick={() => store.openImportant({ subjectId: ids.subjectId, chapterId: ids.chapterId })}
              >
                Marked important
              </Item>
              <Item
                icon="sparkles"
                onClick={() => {
                  store.closeMenus()
                  store.summarizeChapter(ids.subjectId, ids.chapterId)
                  goChapter(ids.subjectId, ids.chapterId)
                }}
              >
                Summarize
              </Item>
            </>
          )}
          {(type === 'subject' || type === 'chapter') && (
            <>
              <Item
                icon="download"
                onClick={() =>
                  store.openExport({ ...scopeCtx, topicId: null }, type === 'subject' ? 'subject' : 'chapter')
                }
              >
                Export PDF
              </Item>
              <Item icon="printer" onClick={() => store.scopedPrint(type === 'subject' ? 'subject' : 'chapter', scopeCtx)}>
                Print
              </Item>
            </>
          )}
          {type === 'subject' && (
            <ColorSwatchRow
              colors={SWATCH_COLORS}
              current={color}
              onPick={(c) => store.recolorSubject(ids.subjectId, c)}
            />
          )}
          <div className="menu-sep" />
          <Item icon="duplicate" onClick={() => store.duplicateNode(type, ids)}>Duplicate</Item>
          <Item icon="arrowUp" onClick={() => store.moveNode(type, ids, -1)}>Move up</Item>
          <Item icon="arrowDown" onClick={() => store.moveNode(type, ids, 1)}>Move down</Item>
          <div className="menu-sep" />
          <Item
            icon={deleteArm ? 'alert' : 'trash'}
            className={`danger ${deleteArm ? 'armed' : ''}`}
            onClick={() => (deleteArm ? store.deleteNode(type, ids) : store.armDelete())}
          >
            {deleteArm ? 'Click again to confirm' : 'Delete…'}
          </Item>
        </>
      )}
    </div>
  )
}
