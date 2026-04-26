import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const CategoryTreeItem = ({ node, depth, onEdit, onDelete }: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: node.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div>
      <div
        ref={setNodeRef}
        style={{ ...style, paddingLeft: depth * 20 }}
        className="flex justify-between items-center border-b p-2 bg-white"
      >
        <div className="flex items-center gap-2">
          <span
            {...attributes}
            {...listeners}
            className="cursor-grab text-gray-400"
          >
            ☰
          </span>

          <span>{node.name}</span>
        </div>

        <div className="space-x-2">
          <button
            onClick={() => onEdit(node)}
            className="text-blue-500"
          >
            Edit
          </button>

          <button
            onClick={() => onDelete(node.id)}
            className="text-red-500"
          >
            Delete
          </button>
        </div>
      </div>

      {node.children?.map((child: any) => (
        <CategoryTreeItem
          key={child.id}
          node={child}
          depth={depth + 1}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default CategoryTreeItem;