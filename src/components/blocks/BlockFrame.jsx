import useNotebookStore from '../../store/useNotebookStore'
import { isEditable, blockEditText } from '../../utils/blocks'
import BlockEditor from './BlockEditor'
import TextBlock from './TextBlock'
import CodeBlock from './CodeBlock'
import DiffBlock from './DiffBlock'
import MathBlock from './MathBlock'
import TodoBlock from './TodoBlock'
import LinkBlock from './LinkBlock'
import DiagramBlock from './DiagramBlock'
import TableBlock from './TableBlock'
import ImageBlock from './ImageBlock'
import ScanBlock from './ScanBlock'

function BlockControls({ canEdit, onUp, onDown, onEdit, onDelete }) {
  return (
    <div className="block-controls no-print">
      <span className="ctrl-chip" title="Move up" onClick={onUp}>↑</span>
      <span className="ctrl-chip" title="Move down" onClick={onDown}>↓</span>
      {canEdit && (
        <span className="ctrl-chip" title="Edit" onClick={onEdit}>✎</span>
      )}
      <span className="ctrl-chip danger" title="Delete" onClick={onDelete}>🗑</span>
    </div>
  )
}

// Block content + right-aligned ↑ ↓ ✎ 🗑 control row below it (hover reveal).
export default function BlockFrame({ block, topicId, editing, onStartEdit, onCloseEdit, initialText }) {
  const store = useNotebookStore.getState()

  const renderBlock = () => {
    switch (block.type) {
      case 'text':
        return <TextBlock block={block} topicId={topicId} onStartEdit={onStartEdit} />
      case 'code':
        return <CodeBlock block={block} />
      case 'code2':
        return <DiffBlock block={block} />
      case 'math':
        return <MathBlock block={block} />
      case 'todo':
        return <TodoBlock block={block} onToggle={() => store.toggleTodo(topicId, block.id)} />
      case 'link':
        return <LinkBlock block={block} />
      case 'diagram':
        return <DiagramBlock block={block} />
      case 'table':
        return <TableBlock block={block} />
      case 'image':
        return <ImageBlock block={block} topicId={topicId} />
      case 'scan':
        return <ScanBlock block={block} topicId={topicId} />
      default:
        return null
    }
  }

  return (
    <div className="block-frame">
      <div className="block-body">
        {editing ? (
          <BlockEditor
            key={block.id}
            block={block}
            initialText={initialText ?? blockEditText(block)}
            onSave={(text) => {
              store.saveBlockEdit(topicId, block.id, text)
              onCloseEdit()
            }}
            onCancel={onCloseEdit}
          />
        ) : (
          renderBlock()
        )}
      </div>
      <BlockControls
        canEdit={isEditable(block.type)}
        onUp={() => store.moveBlock(topicId, block.id, -1)}
        onDown={() => store.moveBlock(topicId, block.id, 1)}
        onEdit={onStartEdit}
        onDelete={() => {
          store.deleteBlock(topicId, block.id)
          onCloseEdit()
        }}
      />
    </div>
  )
}
