const FEATURES = [
  { name: 'GOAL MILESTONES', desc: 'Long-term objectives with progress tracking' },
  { name: 'MILESTONE SYSTEM', desc: 'Break goals into steps with completion bars' },
  { name: 'GOAL REVIEW', desc: 'Weekly AI-powered progress analysis' },
];

export default function GoalsPage() {
  return (
    <div className="placeholder-page">
      <div className="placeholder-header">
        <span className="placeholder-icon">◈</span>
        <div>
          <h2 className="placeholder-title">GOALS MODULE</h2>
          <p className="placeholder-sub">LONG-TERM OBJECTIVE MANAGEMENT</p>
        </div>
      </div>
      <div className="placeholder-status">[ MODULE INITIALIZING ]</div>
      <div className="placeholder-features">
        {FEATURES.map(f => (
          <div key={f.name} className="pf-item">
            <span className="pf-dot" />
            <div className="pf-info">
              <div className="pf-name">{f.name}</div>
              <div className="pf-desc">{f.desc}</div>
            </div>
            <span className="pf-soon">SOON</span>
          </div>
        ))}
      </div>
    </div>
  );
}
