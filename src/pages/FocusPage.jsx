const FEATURES = [
  { name: 'POMODORO TIMER', desc: '25/5 min work cycles with session history' },
  { name: 'AMBIENT SOUNDS', desc: 'Rain, white noise, lo-fi frequencies' },
  { name: 'DEEP WORK MODE', desc: 'Distraction lock with focus score tracking' },
];

export default function FocusPage() {
  return (
    <div className="placeholder-page">
      <div className="placeholder-header">
        <span className="placeholder-icon">◎</span>
        <div>
          <h2 className="placeholder-title">FOCUS MODULE</h2>
          <p className="placeholder-sub">CONCENTRATION & DEEP WORK SYSTEMS</p>
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
