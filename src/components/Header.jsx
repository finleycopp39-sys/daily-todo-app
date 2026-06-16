import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const LABELS = [
  { min: 90, label: 'Excellent 🌟', color: '#22c55e' },
  { min: 70, label: 'Great 💪', color: '#84cc16' },
  { min: 50, label: 'Good 👍', color: '#f97316' },
  { min: 1,  label: 'Keep going 🔥', color: '#ef4444' },
  { min: 0,  label: 'Get started!', color: '#94a3b8' },
];

function getLabel(pct) {
  return LABELS.find(l => pct >= l.min) || LABELS[LABELS.length - 1];
}

export default function Header({ user, percentage, taskCount, onEndDay }) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });
  const prod = getLabel(percentage);

  return (
    <header className="header">
      <div className="header-top">
        <div>
          <h1 className="app-title">Daily Tasks</h1>
          <p className="date-label">{today}</p>
        </div>
        <div className="header-right">
          <img src={user.photoURL} alt={user.displayName} className="avatar" referrerPolicy="no-referrer" />
          <button className="signout-btn" onClick={() => signOut(auth)}>Sign out</button>
        </div>
      </div>

      {taskCount > 0 && (
        <div className="progress-section">
          <div className="progress-header">
            <span className="progress-pct">{percentage}% complete</span>
            <span className="progress-prod" style={{ color: prod.color }}>{prod.label}</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${percentage}%` }} />
          </div>
        </div>
      )}

      <button className="end-day-btn" onClick={onEndDay}>
        End Day &amp; Review
      </button>
    </header>
  );
}
