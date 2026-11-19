import useNotebookStore from '../../store/useNotebookStore'
import { isEditable, blockEditText } from '../../utils/blocks'
import BlockEditor from './BlockEditor'
import TableEditor from './TableEditor'
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
import Icon from '../ui/Icon'

function Ctrl({ icon, label, onClick, className = '' }) {
  return (
    <button type="button" className={`ctrl-chip ${className}`} title={label} aria-label={label} onClick={onClick}>
      <Icon name={icon} size={14} />
    </button>
  )
}

function BlockControls({ canEdit, onUp, onDown, onEdit, onDelete }) {
  return (
    <div className="block-controls no-print" role="toolbar" aria-label="Block actions">
      <Ctrl icon="arrowUp" label="Move up" onClick={onUp} />
      <Ctrl icon="arrowDown" label="Move down" onClick={onDown} />
      {canEdit && <Ctrl icon="pencil" label="Edit" onClick={onEdit} />}
      <Ctrl icon="trash" label="Delete" className="danger" onClick={onDelete} />
    </div>
  )
}

// Block content + ↑ ↓ ✎ 🗑 controls — in the right margin on wide pages,
// a compact row below the block on narrow ones (hover / focus reveal).
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
        return <TableBlock block={block} onStartEdit={onStartEdit} />
      case 'image':
        return <ImageBlock block={block} topicId={topicId} />
      case 'scan':
        return <ScanBlock block={block} topicId={topicId} />
      default:
        return null
    }
  }

  return (
    <div className={`block-frame type-${block.type} ${editing ? 'editing' : ''}`}>
      <div className="block-body">
        {editing && block.type === 'table' ? (
          <TableEditor
            key={block.id}
            initialRows={block.payload.rows}
            onSave={(rows) => {
              store.saveBlockEdit(topicId, block.id, rows)
              onCloseEdit()
            }}
            onCancel={onCloseEdit}
          />
        ) : editing ? (
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
      {!editing && <BlockControls
        canEdit={isEditable(block.type)}
        onUp={() => store.moveBlock(topicId, block.id, -1)}
        onDown={() => store.moveBlock(topicId, block.id, 1)}
        onEdit={onStartEdit}
        onDelete={() => {
          store.deleteBlock(topicId, block.id)
          onCloseEdit()
        }}
      />}
    </div>
  )
}
