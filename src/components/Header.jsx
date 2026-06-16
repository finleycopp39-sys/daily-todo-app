import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const LABELS = [
  { min: 90, label: 'OPTIMAL',  color: '#00ff88' },
  { min: 70, label: 'NOMINAL',  color: '#00d4ff' },
  { min: 50, label: 'AVERAGE',  color: '#ff9900' },
  { min: 1,  label: 'CRITICAL', color: '#ff3d6e' },
  { min: 0,  label: 'STANDBY',  color: 'rgba(0,212,255,0.4)' },
];

function getLabel(pct) {
  return LABELS.find(l => pct >= l.min) ?? LABELS[LABELS.length - 1];
}

function pad(n) { return String(n).padStart(2, '0'); }

export default function Header({ user, percentage, taskCount, onEndDay }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const prod = getLabel(percentage);
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const dateStr = now.toLocaleDateString('en-GB', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
  }).toUpperCase().replace(/,/g, '');

  return (
    <header className="header">
      <div className="header-top">
        <div className="header-brand">
          <h1 className="app-title">DAILY TASKS</h1>
          <span className="header-date">{dateStr}</span>
        </div>
        <div className="header-right">
          <div className="header-clock">{timeStr}</div>
          <div className="header-user">
            <img src={user.photoURL} alt={user.displayName} className="avatar" referrerPolicy="no-referrer" />
            <button className="signout-btn" onClick={() => signOut(auth)}>[ EXIT ]</button>
          </div>
        </div>
      </div>

      {taskCount > 0 && (
        <div className="progress-section">
          <div className="progress-header">
            <span className="progress-label">SYSTEM STATUS</span>
            <span className="progress-pct" style={{ color: prod.color }}>
              {percentage}% — {prod.label}
            </span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${percentage}%` }} />
          </div>
        </div>
      )}

      <button className="end-day-btn" onClick={onEndDay}>[ END SESSION ]</button>
    </header>
  );
}
