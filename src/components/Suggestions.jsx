import { useState } from 'react';

const PRIORITY_LABEL = { high: 'High', medium: 'Med', low: 'Low' };

export default function Suggestions({ tasks, date, onAdd }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [added, setAdded] = useState(new Set());

  const fetchSuggestions = async () => {
    setLoading(true);
    setError(null);
    setData(null);
    setAdded(new Set());
    try {
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks, date }),
      });
      if (!res.ok) throw new Error('Request failed');
      setData(await res.json());
    } catch {
      setError('Could not load suggestions. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (suggestion, index) => {
    onAdd(suggestion.text, suggestion.priority);
    setAdded(prev => new Set([...prev, index]));
  };

  return (
    <section className="suggestions-section">
      <div className="suggestions-header">
        <h2 className="suggestions-title">AI Suggestions</h2>
        <button
          className="btn-ai"
          onClick={fetchSuggestions}
          disabled={loading}
        >
          {loading ? 'Thinking…' : data ? 'Refresh' : '✨ Get Suggestions'}
        </button>
      </div>

      {error && <p className="suggestions-error">{error}</p>}

      {data && (
        <>
          {data.insight && (
            <div className="suggestions-insight">
              <span className="insight-icon">💡</span>
              {data.insight}
            </div>
          )}
          <ul className="suggestions-list">
            {(data.suggestions ?? []).map((s, i) => (
              <li key={i} className="suggestion-item">
                <div className="suggestion-text">
                  <span className={`priority-badge priority-${s.priority}`}>
                    {PRIORITY_LABEL[s.priority] ?? s.priority}
                  </span>
                  {s.text}
                </div>
                <button
                  className="btn-add-suggestion"
                  onClick={() => handleAdd(s, i)}
                  disabled={added.has(i)}
                >
                  {added.has(i) ? '✓ Added' : '+ Add'}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
