import {
  DndContext, closestCenter,
  KeyboardSensor, PointerSensor,
  useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskItem from './TaskItem';

function SortableItem({ task, onToggle, onDelete, isDraggable }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled: !isDraggable,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.45 : 1,
        zIndex: isDragging ? 999 : undefined,
        position: 'relative',
      }}
    >
      <TaskItem
        task={task}
        onToggle={onToggle}
        onDelete={onDelete}
        dragHandleProps={isDraggable ? { ...attributes, ...listeners } : undefined}
      />
    </div>
  );
}

export default function TaskList({ tasks, onToggle, onDelete, onReorder, sortMode }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const isDraggable = sortMode === 'manual';

  const handleDragEnd = event => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = tasks.findIndex(t => t.id === active.id);
    const newIndex = tasks.findIndex(t => t.id === over.id);
    onReorder(arrayMove(tasks, oldIndex, newIndex).map(t => t.id));
  };

  if (tasks.length === 0) {
    return <div className="empty-state"><p>// NO TASKS ASSIGNED — INITIALIZE ABOVE</p></div>;
  }

  const pending = tasks.filter(t => !t.completed);
  const done    = tasks.filter(t => t.completed);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="task-list">
        {pending.length > 0 && (
          <section className="task-section">
            <h3 className="section-heading">QUEUE [{pending.length}]</h3>
            <SortableContext items={pending.map(t => t.id)} strategy={verticalListSortingStrategy}>
              {pending.map(t => (
                <SortableItem
                  key={t.id}
                  task={t}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  isDraggable={isDraggable}
                />
              ))}
            </SortableContext>
          </section>
        )}
        {done.length > 0 && (
          <section className="task-section">
            <h3 className="section-heading done-heading">COMPLETED [{done.length}]</h3>
            {done.map(t => (
              <TaskItem key={t.id} task={t} onToggle={onToggle} onDelete={onDelete} />
            ))}
          </section>
        )}
      </div>
    </DndContext>
  );
}
