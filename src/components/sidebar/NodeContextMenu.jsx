import useNotebookStore, { SWATCH_COLORS } from '../../store/useNotebookStore'
import { useNav } from '../../hooks/useNav'
import ColorSwatchRow from './ColorSwatchRow'

// Inline dropdown card for subject / chapter / topic ⋯ menus.
// items: rename + (subject: export/print/colors) + (chapter: important/summarize/export/print)
// + move up/down + armed delete confirm.
export default function NodeContextMenu({ type, ids, name, color }) {
  const menu = useNotebookStore((s) => s.menu)
  const deleteArm = useNotebookStore((s) => s.deleteArm)
  const renameVal = useNotebookStore((s) => s.renameVal)
  const store = useNotebookStore.getState()
  const { goChapter } = useNav()

  const armed = deleteArm

  const onRenameKey = (e) => {
    if (e.key === 'Enter') store.applyRename()
    if (e.key === 'Escape') store.closeMenus()
  }

  const stop = (fn) => (e) => {
    e.stopPropagation()
    fn()
  }

  return (
    <div className={`node-menu ${type}`} onClick={(e) => e.stopPropagation()}>
      {menu?.renaming ? (
        <>
          <input
            autoFocus
            className="menu-input"
            value={renameVal}
            onChange={(e) => store.setRenameVal(e.target.value)}
            onKeyDown={onRenameKey}
          />
          <div className="menu-btn-row">
            <button className="menu-btn-save" onClick={stop(() => store.applyRename())}>Save</button>
            <button className="menu-btn-cancel" onClick={stop(() => store.closeMenus())}>Cancel</button>
          </div>
        </>
      ) : (
        <>
          <div className="menu-item" onClick={stop(() => store.startRename(name))}>✎ Rename</div>
          {type === 'chapter' && (
            <>
              <div
                className="menu-item"
                onClick={stop(() => store.openImportant({ subjectId: ids.subjectId, chapterId: ids.chapterId }))}
              >
                ★ Marked important
              </div>
              <div
                className="menu-item"
                onClick={stop(() => {
                  store.closeMenus()
                  store.summarizeChapter(ids.subjectId, ids.chapterId)
                  goChapter(ids.subjectId, ids.chapterId)
                })}
              >
                ✦ Summarize
              </div>
            </>
          )}
          {(type === 'subject' || type === 'chapter') && (
            <>
              <div
                className="menu-item"
                onClick={stop(() =>
                  store.openExport(
                    {
                      subjectId: ids.subjectId,
                      chapterId: type === 'subject' ? null : ids.chapterId,
                      topicId: null,
                    },
                    type === 'subject' ? 'subject' : 'chapter'
                  )
                )}
              >
                ⇩ Export PDF
              </div>
              <div
                className="menu-item"
                onClick={stop(() =>
                  store.scopedPrint(type === 'subject' ? 'subject' : 'chapter', {
                    subjectId: ids.subjectId,
                    chapterId: type === 'subject' ? null : ids.chapterId,
                  })
                )}
              >
                ⎙ Print
              </div>
            </>
          )}
          {type === 'subject' && (
            <ColorSwatchRow
              colors={SWATCH_COLORS}
              current={color}
              onPick={(c) => store.recolorSubject(ids.subjectId, c)}
            />
          )}
          <div className="menu-item" onClick={stop(() => store.moveNode(type, ids, -1))}>↑ Move up</div>
          <div className="menu-item" onClick={stop(() => store.moveNode(type, ids, 1))}>↓ Move down</div>
          <div
            className={`menu-item danger ${armed ? 'armed' : ''}`}
            onClick={stop(() => (armed ? store.deleteNode(type, ids) : store.armDelete()))}
          >
            {armed ? '⚠ Click again to confirm' : '🗑 Delete…'}
          </div>
        </>
      )}
    </div>
  )
}
