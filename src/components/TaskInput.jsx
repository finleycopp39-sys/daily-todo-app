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
          placeholder="Enter task directive..."
          className="text-input"
          autoComplete="off"
        />
        <button
          type="button"
          className={`voice-btn${isListening ? ' listening' : ''}`}
          onClick={isListening ? stopListening : startListening}
          title={isListening ? 'Stop listening' : 'Voice input'}
        >
          {isListening ? '[ ■ STOP ]' : '[ ◉ MIC ]'}
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
              {p.toUpperCase()}
            </button>
          ))}
        </div>
        <button type="submit" className="add-btn" disabled={!text.trim()}>
          [ + ADD ]
        </button>
      </div>
      {isListening && (
        <p className="voice-hint">◉ LISTENING — SPEAK YOUR DIRECTIVE</p>
      )}
    </form>
  );
}
