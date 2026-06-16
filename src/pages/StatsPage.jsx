import { useStats } from '../hooks/useStats';

function StatCard({ value, label, color }) {
  return (
    <div className="stats-card">
      <span className="stats-card-num" style={{ color }}>{value}</span>
      <span className="stats-card-lbl">{label}</span>
    </div>
  );
}

function BarChart({ weekDayData, today }) {
  const maxTotal = Math.max(...weekDayData.map(d => d.total), 1);
  return (
    <div className="bar-chart">
      {weekDayData.map(day => {
        const pct = day.total > 0 ? (day.done / day.total) * 100 : 0;
        const isToday = day.date === today;
        return (
          <div key={day.date} className={`bar-col${isToday ? ' today' : ''}`}>
            <div className="bar-count-top">{day.total > 0 ? `${day.done}/${day.total}` : '—'}</div>
            <div className="bar-wrap">
              <div
                className="bar-fill"
                style={{ height: `${pct}%` }}
              />
            </div>
            <div className="bar-label">{day.day}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function StatsPage({ user }) {
  const { stats, loading, error } = useStats(user);

  if (loading) {
    return (
      <div className="stats-loading">
        <div className="loading-spinner" />
        <p className="stats-loading-text">COMPILING INTEL...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stats-error">
        <span className="stats-error-icon">⚠</span>
        <p>DATA LINK FAULT — {error}</p>
      </div>
    );
  }

  const { currentStreak, longestStreak, todayDone, todayTotal, weekDone,
    weekTotal, monthDone, weekRate, bestDay, weekDayData, today } = stats;

  const streakColor = currentStreak >= 7 ? 'var(--low)' : currentStreak >= 3 ? 'var(--medium)' : 'var(--cyan)';

  return (
    <div className="stats-page">
      <div className="stats-page-header">
        <h2 className="stats-page-title">INTEL DASHBOARD</h2>
        <span className="stats-page-sub">PERFORMANCE ANALYTICS · 90-DAY WINDOW</span>
      </div>

      {/* Streaks */}
      <div className="stats-streak-panel">
        <div className="streak-main">
          <span className="streak-icon">◈</span>
          <div>
            <div className="streak-num" style={{ color: streakColor }}>{currentStreak}</div>
            <div className="streak-lbl">DAY STREAK</div>
          </div>
        </div>
        <div className="streak-divider" />
        <div className="streak-secondary">
          <div className="streak-peak-num">{longestStreak}</div>
          <div className="streak-peak-lbl">PEAK STREAK</div>
        </div>
        {currentStreak >= 3 && (
          <div className="streak-badge">
            {currentStreak >= 7 ? '◈ ON FIRE' : currentStreak >= 3 ? '◎ ACTIVE' : ''}
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div className="stats-row">
        <StatCard value={`${todayDone}/${todayTotal}`} label="TODAY" color="var(--cyan)" />
        <StatCard value={weekDone} label="THIS WEEK" color="var(--medium)" />
        <StatCard value={monthDone} label="THIS MONTH" color="var(--low)" />
      </div>

      {/* Completion rate */}
      <div className="stats-rate-panel">
        <span className="rate-label">WEEKLY COMPLETION RATE</span>
        <div className="rate-bar-wrap">
          <div className="rate-bar-track">
            <div className="rate-bar-fill" style={{ width: `${weekRate}%` }} />
          </div>
          <span className="rate-pct">{weekRate}%</span>
        </div>
        <span className={`rate-status ${weekRate >= 80 ? 'status-good' : weekRate >= 50 ? 'status-ok' : 'status-low'}`}>
          {weekRate >= 80 ? '[ OPTIMAL ]' : weekRate >= 50 ? '[ NOMINAL ]' : weekRate > 0 ? '[ BELOW TARGET ]' : '[ NO DATA ]'}
        </span>
      </div>

      {/* Weekly bar chart */}
      <div className="stats-panel">
        <h3 className="stats-panel-title">WEEKLY PERFORMANCE</h3>
        <BarChart weekDayData={weekDayData} today={today} />
      </div>

      {/* Best day */}
      {bestDay && (
        <div className="stats-best-day">
          <span className="best-day-label">PEAK PERFORMANCE DAY</span>
          <span className="best-day-value">{bestDay}</span>
        </div>
      )}
    </div>
  );
}
