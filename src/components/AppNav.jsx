const NAV_ITEMS = [
  { id: 'tasks',  label: 'TASKS',  icon: '⊟' },
  { id: 'focus',  label: 'FOCUS',  icon: '◎' },
  { id: 'habits', label: 'HABITS', icon: '⊞' },
  { id: 'goals',  label: 'GOALS',  icon: '◈' },
  { id: 'stats',  label: 'STATS',  icon: '▤' },
];

export default function AppNav({ page, onSetPage }) {
  return (
    <>
      <aside className="app-nav-sidebar">
        <div className="nav-brand">
          <span className="nav-brand-icon">◉</span>
          <span className="nav-brand-text">DAILY<br />TASKS</span>
        </div>
        <nav className="nav-items-sidebar">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`nav-item-sidebar${page === item.id ? ' active' : ''}`}
              onClick={() => onSetPage(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <nav className="app-nav-bottom">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`nav-item-bottom${page === item.id ? ' active' : ''}`}
            onClick={() => onSetPage(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
