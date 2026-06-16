export default function TaskItem({ task, onToggle, onDelete }) {
  return (
    <div className={`task-item${task.completed ? ' completed' : ''}`}>
      <button
        className={`check-btn${task.completed ? ' checked' : ''}`}
        onClick={() => onToggle(task.id, task.completed)}
        aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {task.completed ? '✓' : ''}
      </button>
      <div className="task-body">
        <span className="task-text">{task.text}</span>
        <div className="task-tags">
          <span className={`priority-badge priority-${task.priority}`}>{task.priority}</span>
          {task.carriedOver && <span className="carried-badge">carried over</span>}
        </div>
      </div>
      <button className="delete-btn" onClick={() => onDelete(task.id)} aria-label="Delete task">
        ✕
      </button>
    </div>
  );
}
