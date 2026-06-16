import { useState, useCallback } from 'react';
import { useSpeech } from '../hooks/useSpeech';

const PRIORITIES = ['high', 'medium', 'low'];
const RECURRENCES = [
  { id: 'none',  label: 'ONCE' },
  { id: 'daily', label: 'DAILY' },
];

export default function TaskInput({ onAdd, date, compact = false, onCancel = null }) {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState('medium');
  const [showReminder, setShowReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState('');
  const [recurrence, setRecurrence] = useState('none');

  const handleVoiceResult = useCallback(t => setText(t), []);
  const { isListening, startListening, stopListening } = useSpeech(handleVoiceResult);

  const handleSubmit = e => {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(text.trim(), priority, reminderTime || null, recurrence);
    setText('');
    setPriority('medium');
    setReminderTime('');
    setRecurrence('none');
    setShowReminder(false);
  };

  return (
    <form className={`task-input-form${compact ? ' compact' : ''}`} onSubmit={handleSubmit}>
      <div className="input-row">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Enter task directive..."
          className="text-input"
          autoComplete="off"
          autoFocus={compact}
        />
        {!compact && (
          <button
            type="button"
            className={`voice-btn${isListening ? ' listening' : ''}`}
            onClick={isListening ? stopListening : startListening}
          >
            {isListening ? '[ ■ STOP ]' : '[ ◉ MIC ]'}
          </button>
        )}
      </div>

      <div className="priority-submit-row">
        <div className="priority-group">
          {PRIORITIES.map(p => (
            <button
              key={p}
              type="button"
              className={`priority-pill priority-${p}${priority === p ? ' active' : ''}`}
              onClick={() => setPriority(p)}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="input-actions">
          <button
            type="button"
            className={`reminder-toggle${showReminder ? ' active' : ''}`}
            onClick={() => setShowReminder(s => !s)}
            title="Set reminder"
          >
            🔔
          </button>
          <button type="submit" className="add-btn" disabled={!text.trim()}>
            [ + ADD ]
          </button>
        </div>
      </div>

      {showReminder && (
        <div className="reminder-section">
          <div className="reminder-row">
            <span className="reminder-label">TIME</span>
            <input
              type="time"
              value={reminderTime}
              onChange={e => setReminderTime(e.target.value)}
              className="time-input"
            />
            <div className="recurrence-group">
              {RECURRENCES.map(r => (
                <button
                  key={r.id}
                  type="button"
                  className={`recurrence-btn${recurrence === r.id ? ' active' : ''}`}
                  onClick={() => setRecurrence(r.id)}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {isListening && <p className="voice-hint">◉ LISTENING — SPEAK YOUR DIRECTIVE</p>}

      {compact && onCancel && (
        <button type="button" className="compact-cancel" onClick={onCancel}>
          [ CANCEL ]
        </button>
      )}
    </form>
  );
}
