import TaskItem from './TaskItem';

export default function TaskList({ tasks, onToggle, onDelete }) {
  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <p>No tasks yet — add one above or use the mic!</p>
      </div>
    );
  }

  const pending = tasks.filter(t => !t.completed);
  const done = tasks.filter(t => t.completed);

  return (
    <div className="task-list">
      {pending.length > 0 && (
        <section className="task-section">
          <h3 className="section-heading">To Do ({pending.length})</h3>
          {pending.map(t => (
            <TaskItem key={t.id} task={t} onToggle={onToggle} onDelete={onDelete} />
          ))}
        </section>
      )}
      {done.length > 0 && (
        <section className="task-section">
          <h3 className="section-heading done-heading">Done ({done.length})</h3>
          {done.map(t => (
            <TaskItem key={t.id} task={t} onToggle={onToggle} onDelete={onDelete} />
          ))}
        </section>
      )}
    </div>
  );
}
