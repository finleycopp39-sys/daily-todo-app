import { useState } from 'react';

function getMessage(pct) {
  if (pct === 100) return "Perfect day! You completed everything!";
  if (pct >= 90) return "Excellent work — you absolutely crushed it today!";
  if (pct >= 70) return "Great job! Really productive day.";
  if (pct >= 50) return "Good effort — more than halfway there!";
  if (pct > 0) return "You made a start. Tomorrow you can push further!";
  return "Tomorrow is a fresh start — you've got this!";
}

function getColor(pct) {
  if (pct >= 70) return '#22c55e';
  if (pct >= 50) return '#f97316';
  return '#ef4444';
}

export default function DailySummary({ tasks, date, onClose, onCarryOver }) {
  const completed = tasks.filter(t => t.completed);
  const incomplete = tasks.filter(t => !t.completed);
  const pct = tasks.length ? Math.round((completed.length / tasks.length) * 100) : 0;
  const [selected, setSelected] = useState(new Set(incomplete.map(t => t.id)));
  const [saving, setSaving] = useState(false);

  const toggle = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDone = async () => {
    setSaving(true);
    if (selected.size > 0) {
      await onCarryOver([...selected]);
    }
    setSaving(false);
    onClose();
  };

  const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  const highDone = completed.filter(t => t.priority === 'high').length;
  const highTotal = tasks.filter(t => t.priority === 'high').length;
  const medDone = completed.filter(t => t.priority === 'medium').length;
  const medTotal = tasks.filter(t => t.priority === 'medium').length;
  const lowDone = completed.filter(t => t.priority === 'low').length;
  const lowTotal = tasks.filter(t => t.priority === 'low').length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2 className="modal-title">Day Review</h2>
        <p className="modal-date">{formattedDate}</p>

        <div className="summary-score" style={{ color: getColor(pct) }}>
          {pct}%
        </div>
        <p className="summary-message">{getMessage(pct)}</p>

        <div className="summary-track">
          <div className="summary-fill" style={{ width: `${pct}%`, background: getColor(pct) }} />
        </div>

        <div className="summary-stats">
          <div className="stat-card">
            <span className="stat-num">{tasks.length}</span>
            <span className="stat-lbl">Total</span>
          </div>
          <div className="stat-card">
            <span className="stat-num" style={{ color: '#22c55e' }}>{completed.length}</span>
            <span className="stat-lbl">Done</span>
          </div>
          <div className="stat-card">
            <span className="stat-num" style={{ color: '#ef4444' }}>{incomplete.length}</span>
            <span className="stat-lbl">Left</span>
          </div>
        </div>

        {tasks.length > 0 && (
          <div className="priority-breakdown">
            <h4>By Priority</h4>
            {highTotal > 0 && (
              <div className="breakdown-row">
                <span className="priority-badge priority-high">high</span>
                <span>{highDone}/{highTotal} done</span>
              </div>
            )}
            {medTotal > 0 && (
              <div className="breakdown-row">
                <span className="priority-badge priority-medium">medium</span>
                <span>{medDone}/{medTotal} done</span>
              </div>
            )}
            {lowTotal > 0 && (
              <div className="breakdown-row">
                <span className="priority-badge priority-low">low</span>
                <span>{lowDone}/{lowTotal} done</span>
              </div>
            )}
          </div>
        )}

        {incomplete.length > 0 && (
          <div className="carryover-section">
            <h4>Carry over to tomorrow?</h4>
            <p className="carryover-hint">Checked tasks will be added to tomorrow's list</p>
            {incomplete.map(task => (
              <label key={task.id} className="carryover-item">
                <input
                  type="checkbox"
                  checked={selected.has(task.id)}
                  onChange={() => toggle(task.id)}
                />
                <span className={`priority-badge priority-${task.priority}`}>{task.priority}</span>
                <span className="carryover-text">{task.text}</span>
              </label>
            ))}
          </div>
        )}

        <div className="modal-footer">
          <button className="modal-cancel" onClick={onClose}>Cancel</button>
          <button className="modal-done" onClick={handleDone} disabled={saving}>
            {saving ? 'Saving...' : selected.size > 0
              ? `Carry Over ${selected.size} Task${selected.size > 1 ? 's' : ''}`
              : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
}
