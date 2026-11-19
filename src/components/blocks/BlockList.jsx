import useNotebookStore from '../../store/useNotebookStore'
import BlockFrame from './BlockFrame'
import BlockEditor from './BlockEditor'
import TableEditor from './TableEditor'

export default function BlockList({ topic, editing, onStartEdit, onCloseEdit, onKeepAsText }) {
  const store = useNotebookStore.getState()
  return (
    <>
      {topic.blocks.map((block) => (
        <BlockFrame
          key={block.id}
          block={block}
          topicId={topic.id}
          editing={editing?.blockId === block.id}
          initialText={editing?.blockId === block.id ? editing.initialText : undefined}
          onStartEdit={() => onStartEdit(block)}
          onCloseEdit={onCloseEdit}
        />
      ))}
      {editing?.draft && (
        <div className="block-frame">
          <div className="block-body">
            {editing.draft === 'table' ? (
              <TableEditor
                key={'draft-table-' + (editing.pastedFrom || '')}
                initialRows={editing.initialRows}
                pastedFrom={editing.pastedFrom}
                onKeepAsText={editing.pastedFrom ? () => onKeepAsText?.(editing.pastedFrom) : undefined}
                onSave={(rows) => {
                  store.insertBlock(topic.id, 'table', rows)
                  onCloseEdit()
                }}
                onCancel={onCloseEdit}
              />
            ) : (
            <BlockEditor
              key={'draft-' + editing.draft}
              block={{ type: editing.draft }}
              initialText={editing.initialText ?? ''}
              onSave={(text) => {
                store.insertBlock(topic.id, editing.draft, text)
                onCloseEdit()
              }}
              onCancel={onCloseEdit}
            />
            )}
          </div>
        </div>
      )}
    </>
  )
}
