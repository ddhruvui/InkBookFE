import BlockFrame from './BlockFrame'

export default function BlockList({ topic, editing, onStartEdit, onCloseEdit }) {
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
    </>
  )
}
