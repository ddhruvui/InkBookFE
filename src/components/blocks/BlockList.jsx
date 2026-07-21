import useNotebookStore from '../../store/useNotebookStore'
import BlockFrame from './BlockFrame'
import BlockEditor from './BlockEditor'

export default function BlockList({ topic, editing, onStartEdit, onCloseEdit }) {
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
          </div>
        </div>
      )}
    </>
  )
}
