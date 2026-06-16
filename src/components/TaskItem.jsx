export default function TaskItem({ task, onToggle, onDelete, dragHandleProps }) {
  return (
    <div className={`task-item${task.completed ? ' completed' : ''}`}>
      {dragHandleProps && (
        <span className="drag-handle" {...dragHandleProps} title="Drag to reorder">⠿</span>
      )}
      <button
        className={`hud-check${task.completed ? ' checked' : ''}`}
        onClick={() => onToggle(task.id, task.completed)}
        aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
      />
      <div className="task-body">
        <span className="task-text">{task.text}</span>
        <div className="task-tags">
          <span className={`priority-badge priority-${task.priority}`}>{task.priority}</span>
          {task.reminderTime && (
            <span className="reminder-badge">
              🔔 {task.reminderTime}{task.reminderRecurrence === 'daily' ? ' · DAILY' : ''}
            </span>
          )}
          {task.carriedOver && <span className="carried-badge">CARRIED</span>}
        </div>
      </div>
      <button className="delete-btn" onClick={() => onDelete(task.id)} aria-label="Delete task">
        [×]
      </button>
    </div>
  );
}
