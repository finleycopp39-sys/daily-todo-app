export default function ViewToggle({ view, onSetView }) {
  return (
    <div className="view-toggle">
      <button
        className={`view-btn${view === 'today' ? ' active' : ''}`}
        onClick={() => onSetView('today')}
      >
        [ TODAY ]
      </button>
      <button
        className={`view-btn${view === 'week' ? ' active' : ''}`}
        onClick={() => onSetView('week')}
      >
        [ THIS WEEK ]
      </button>
    </div>
  );
}
