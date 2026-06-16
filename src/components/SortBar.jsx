const MODES = [
  { id: 'manual',   label: 'MANUAL' },
  { id: 'priority', label: 'PRIORITY' },
  { id: 'time',     label: 'TIME' },
];

export default function SortBar({ sortMode, onSetSortMode }) {
  return (
    <div className="sort-bar">
      <span className="sort-label">ORDER:</span>
      <div className="sort-btns">
        {MODES.map(m => (
          <button
            key={m.id}
            className={`sort-btn${sortMode === m.id ? ' active' : ''}`}
            onClick={() => onSetSortMode(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
