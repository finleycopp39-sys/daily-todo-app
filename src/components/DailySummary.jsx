import { useState } from 'react';

function getMessage(pct) {
  if (pct === 100) return "// ALL TASKS COMPLETED. PERFECT EXECUTION.";
  if (pct >= 90) return "// NEAR-OPTIMAL PERFORMANCE. EXCELLENT WORK.";
  if (pct >= 70) return "// NOMINAL PERFORMANCE. GOOD PROGRESS.";
  if (pct >= 50) return "// AVERAGE PERFORMANCE. PUSH FURTHER TOMORROW.";
  if (pct > 0) return "// BELOW NOMINAL. RECALIBRATE AND RETRY.";
  return "// SYSTEM IDLE. INITIALIZE TASKS TOMORROW.";
}

function getColor(pct) {
  if (pct >= 70) return '#00ff88';
  if (pct >= 50) return '#ff9900';
  return '#ff3d6e';
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
    if (selected.size > 0) await onCarryOver([...selected]);
    setSaving(false);
    onClose();
  };

  const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'long', month: 'long', day: 'numeric',
  }).toUpperCase();

  const highDone  = completed.filter(t => t.priority === 'high').length;
  const highTotal = tasks.filter(t => t.priority === 'high').length;
  const medDone   = completed.filter(t => t.priority === 'medium').length;
  const medTotal  = tasks.filter(t => t.priority === 'medium').length;
  const lowDone   = completed.filter(t => t.priority === 'low').length;
  const lowTotal  = tasks.filter(t => t.priority === 'low').length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2 className="modal-title">SESSION REVIEW</h2>
        <p className="modal-date">{formattedDate}</p>

        <div className="summary-score" style={{ color: getColor(pct) }}>{pct}%</div>
        <p className="summary-message">{getMessage(pct)}</p>

        <div className="summary-track">
          <div className="summary-fill" style={{ width: `${pct}%`, background: getColor(pct) }} />
        </div>

        <div className="summary-stats">
          <div className="stat-card">
            <span className="stat-num" style={{ color: '#00d4ff' }}>{tasks.length}</span>
            <span className="stat-lbl">TOTAL</span>
          </div>
          <div className="stat-card">
            <span className="stat-num" style={{ color: '#00ff88' }}>{completed.length}</span>
            <span className="stat-lbl">DONE</span>
          </div>
          <div className="stat-card">
            <span className="stat-num" style={{ color: '#ff3d6e' }}>{incomplete.length}</span>
            <span className="stat-lbl">LEFT</span>
          </div>
        </div>

        {tasks.length > 0 && (
          <div className="priority-breakdown">
            <h4>PRIORITY BREAKDOWN</h4>
            {highTotal > 0 && (
              <div className="breakdown-row">
                <span className="priority-badge priority-high">HIGH</span>
                <span>{highDone}/{highTotal} DONE</span>
              </div>
            )}
            {medTotal > 0 && (
              <div className="breakdown-row">
                <span className="priority-badge priority-medium">MED</span>
                <span>{medDone}/{medTotal} DONE</span>
              </div>
            )}
            {lowTotal > 0 && (
              <div className="breakdown-row">
                <span className="priority-badge priority-low">LOW</span>
                <span>{lowDone}/{lowTotal} DONE</span>
              </div>
            )}
          </div>
        )}

        {incomplete.length > 0 && (
          <div className="carryover-section">
            <h4>QUEUE TRANSFER</h4>
            <p className="carryover-hint">Selected tasks will be forwarded to tomorrow</p>
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
          <button className="modal-cancel" onClick={onClose}>[ CANCEL ]</button>
          <button className="modal-done" onClick={handleDone} disabled={saving}>
            {saving ? '[ SAVING... ]' : selected.size > 0
              ? `[ TRANSFER ${selected.size} ]`
              : '[ CLOSE ]'}
          </button>
        </div>
      </div>
    </div>
  );
}
