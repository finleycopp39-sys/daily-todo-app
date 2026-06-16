const FEATURES = [
  { name: 'HABIT TRACKING', desc: 'Daily check-ins with streak counters' },
  { name: 'CONTRIBUTION GRID', desc: 'GitHub-style 90-day activity heatmap' },
  { name: 'HABIT INSIGHTS', desc: 'Success rates and optimal timing analysis' },
];

export default function HabitsPage() {
  return (
    <div className="placeholder-page">
      <div className="placeholder-header">
        <span className="placeholder-icon">⊞</span>
        <div>
          <h2 className="placeholder-title">HABITS MODULE</h2>
          <p className="placeholder-sub">ROUTINE ENGINEERING & STREAK TRACKING</p>
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
