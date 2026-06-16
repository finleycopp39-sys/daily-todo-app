import { useState, useCallback } from 'react';
import { useSpeech } from '../hooks/useSpeech';

const PRIORITIES = ['high', 'medium', 'low'];

export default function TaskInput({ onAdd }) {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState('medium');

  const handleVoiceResult = useCallback((transcript) => {
    setText(transcript);
  }, []);

  const { isListening, startListening, stopListening } = useSpeech(handleVoiceResult);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(text.trim(), priority);
    setText('');
    setPriority('medium');
  };

  return (
    <form className="task-input-form" onSubmit={handleSubmit}>
      <div className="input-row">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Add a task..."
          className="text-input"
          autoComplete="off"
        />
        <button
          type="button"
          className={`voice-btn${isListening ? ' listening' : ''}`}
          onClick={isListening ? stopListening : startListening}
          title={isListening ? 'Stop listening' : 'Voice input'}
        >
          {isListening ? '⏹' : '🎤'}
        </button>
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
              {p}
            </button>
          ))}
        </div>
        <button type="submit" className="add-btn" disabled={!text.trim()}>
          Add
        </button>
      </div>
      {isListening && (
        <p className="voice-hint">Listening... speak your task</p>
      )}
    </form>
  );
}
