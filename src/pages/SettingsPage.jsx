import { useState, useCallback } from 'react';
import { useTheme, THEMES, FONT_OPTIONS, BG_OPTIONS } from '../contexts/ThemeContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const SECTIONS = ['appearance', 'profile', 'notifications', 'widget', 'data', 'about'];

const TAB_LABELS = {
  appearance:    'APPEARANCE',
  profile:       'PROFILE',
  notifications: 'NOTIFY',
  widget:        'WIDGET',
  data:          'DATA',
  about:         'ABOUT',
};

// ---------------------------------------------------------------------------
// AppearanceSection
// ---------------------------------------------------------------------------

function AppearanceSection() {
  const { prefs, updatePref, resetToTheme, theme } = useTheme();

  const activeThemeId = prefs.themeId;
  const activeBg = prefs.bgPattern ?? theme.bgPattern;
  const activeBodyFont = prefs.bodyFont ?? theme.bodyFont;

  const handleAccentColorChange = useCallback((e) => {
    updatePref('customAccent', e.target.value);
  }, [updatePref]);

  const handleAccentHexChange = useCallback((e) => {
    const val = e.target.value;
    if (/^#[0-9a-fA-F]{6}$/.test(val)) {
      updatePref('customAccent', val);
    }
  }, [updatePref]);

  const handleResetAccent = useCallback(() => {
    updatePref('customAccent', null);
  }, [updatePref]);

  const handleBgPattern = useCallback((id) => {
    updatePref('bgPattern', id);
  }, [updatePref]);

  const handleIntensity = useCallback((level) => {
    updatePref('bgIntensity', level);
  }, [updatePref]);

  const handleBodyFont = useCallback((fontId) => {
    updatePref('bodyFont', fontId);
  }, [updatePref]);

  const currentAccent = prefs.customAccent ?? theme.accent;

  return (
    <div className="settings-section">

      {/* Theme Grid */}
      <div className="settings-group">
        <div className="settings-group-label">THEME PRESET</div>
        <div className="theme-grid">
          {Object.values(THEMES).map((t) => (
            <div
              key={t.id}
              className={`theme-card${activeThemeId === t.id ? ' active' : ''}`}
              onClick={() => resetToTheme(t.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && resetToTheme(t.id)}
            >
              <div
                className="theme-card-preview"
                style={{
                  background: t.bg,
                  boxShadow: `0 0 12px ${t.accent}40`,
                }}
              >
                <div className="theme-preview-dots">
                  <span style={{ background: t.accent, borderRadius: '50%', width: 6, height: 6, display: 'inline-block' }} />
                  <span style={{ background: t.accent, borderRadius: '50%', width: 6, height: 6, display: 'inline-block' }} />
                  <span style={{ background: t.accent, borderRadius: '50%', width: 6, height: 6, display: 'inline-block' }} />
                </div>
                <div
                  className="theme-preview-bar"
                  style={{ background: t.accent }}
                />
              </div>
              <div className="theme-card-name">{t.name}</div>
              <div className="theme-card-desc">{t.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Accent Color */}
      <div className="settings-group">
        <div className="settings-group-label">ACCENT COLOR</div>
        <div className="accent-row">
          <input
            type="color"
            value={currentAccent}
            onChange={handleAccentColorChange}
            className="accent-color-picker"
          />
          <input
            type="text"
            className="accent-hex-input"
            defaultValue={currentAccent}
            key={currentAccent}
            onBlur={handleAccentHexChange}
            onKeyDown={(e) => e.key === 'Enter' && handleAccentHexChange(e)}
            maxLength={7}
            placeholder="#00d4ff"
          />
          <button className="accent-reset-btn" onClick={handleResetAccent}>
            RESET
          </button>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="settings-group">
        <div className="settings-group-label">BACKGROUND PATTERN</div>
        <div className="bg-opts-row">
          {BG_OPTIONS.map((opt) => {
            const isActive = activeBg === opt.id;
            return (
              <button
                key={opt.id}
                className={`bg-opt${isActive ? ' active' : ''}`}
                onClick={() => handleBgPattern(opt.id)}
              >
                <span className="bg-opt-label">{opt.label}</span>
                <span className="bg-opt-desc">{opt.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Background Intensity */}
      <div className="settings-group">
        <div className="settings-group-label">PATTERN INTENSITY</div>
        <div className="intensity-row">
          {['subtle', 'medium', 'strong'].map((level) => (
            <button
              key={level}
              className={`intensity-btn${prefs.bgIntensity === level ? ' active' : ''}`}
              onClick={() => handleIntensity(level)}
            >
              {level.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Body Font */}
      <div className="settings-group">
        <div className="settings-group-label">BODY FONT</div>
        <div className="font-grid">
          {Object.entries(FONT_OPTIONS).map(([fontId, font]) => {
            const isActive = activeBodyFont === fontId;
            return (
              <button
                key={fontId}
                className={`font-opt${isActive ? ' active' : ''}`}
                onClick={() => handleBodyFont(fontId)}
                style={{ fontFamily: font.family }}
              >
                <span className="font-opt-label">{font.label}</span>
                <span className="font-opt-tag">{font.tag}</span>
                <span className="font-opt-preview" style={{ fontFamily: font.family }}>
                  ABCD 0123
                </span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}

// ---------------------------------------------------------------------------
// ProfileSection
// ---------------------------------------------------------------------------

const AVATAR_SYMBOLS = ['◎', '⬡', '◈', '⊞', '△', '◆', '✦', '⊙'];

const TIMEZONES = [
  'America/New_York',    'America/Chicago',     'America/Denver',      'America/Los_Angeles',
  'America/Anchorage',   'Pacific/Honolulu',    'America/Toronto',     'America/Vancouver',
  'America/Sao_Paulo',   'Europe/London',       'Europe/Paris',        'Europe/Berlin',
  'Europe/Rome',         'Europe/Madrid',       'Europe/Stockholm',    'Europe/Moscow',
  'Asia/Dubai',          'Asia/Kolkata',        'Asia/Bangkok',        'Asia/Shanghai',
  'Asia/Tokyo',          'Asia/Seoul',          'Australia/Sydney',    'Pacific/Auckland',
];

function ProfileSection() {
  const { prefs, updateProfile } = useTheme();
  const profile = prefs.profile;

  const handleAvatarSelect = useCallback((idx) => {
    updateProfile({ avatarId: idx });
  }, [updateProfile]);

  const handleNameChange = useCallback((e) => {
    updateProfile({ name: e.target.value });
  }, [updateProfile]);

  const handleTimezoneChange = useCallback((e) => {
    updateProfile({ timezone: e.target.value });
  }, [updateProfile]);

  const handleWorkStartChange = useCallback((e) => {
    updateProfile({ workStart: e.target.value });
  }, [updateProfile]);

  const handleWorkEndChange = useCallback((e) => {
    updateProfile({ workEnd: e.target.value });
  }, [updateProfile]);

  return (
    <div className="settings-section">

      {/* Avatar */}
      <div className="settings-group">
        <div className="settings-group-label">AVATAR</div>
        <div className="avatar-grid">
          {AVATAR_SYMBOLS.map((sym, idx) => (
            <button
              key={idx}
              className={`avatar-opt${profile.avatarId === idx ? ' active' : ''}`}
              onClick={() => handleAvatarSelect(idx)}
            >
              {sym}
            </button>
          ))}
        </div>
      </div>

      {/* Name */}
      <div className="settings-group">
        <label className="settings-label" htmlFor="profile-name">
          DISPLAY NAME
        </label>
        <input
          id="profile-name"
          type="text"
          className="settings-input"
          value={profile.name}
          onChange={handleNameChange}
          placeholder="OPERATOR"
          maxLength={32}
        />
      </div>

      {/* Timezone */}
      <div className="settings-group">
        <label className="settings-label" htmlFor="profile-timezone">
          TIMEZONE
        </label>
        <select
          id="profile-timezone"
          className="settings-select"
          value={profile.timezone}
          onChange={handleTimezoneChange}
        >
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </div>

      {/* Work Hours */}
      <div className="settings-group">
        <div className="settings-group-label">WORK HOURS</div>
        <div className="work-hours-row">
          <div className="work-hours-field">
            <label className="settings-label-sm" htmlFor="work-start">START</label>
            <input
              id="work-start"
              type="time"
              className="settings-input settings-input-time"
              value={profile.workStart}
              onChange={handleWorkStartChange}
            />
          </div>
          <span className="work-hours-sep">—</span>
          <div className="work-hours-field">
            <label className="settings-label-sm" htmlFor="work-end">END</label>
            <input
              id="work-end"
              type="time"
              className="settings-input settings-input-time"
              value={profile.workEnd}
              onChange={handleWorkEndChange}
            />
          </div>
        </div>
      </div>

    </div>
  );
}

// ---------------------------------------------------------------------------
// NotificationsSection
// ---------------------------------------------------------------------------

function NotificationsSection() {
  const { prefs, updatePref } = useTheme();

  const handleTimeChange = useCallback((e) => {
    updatePref('notifDefaultTime', e.target.value);
  }, [updatePref]);

  const handleDigestChange = useCallback((e) => {
    updatePref('notifDigest', e.target.checked);
  }, [updatePref]);

  return (
    <div className="settings-section">

      <div className="settings-group">
        <label className="settings-label" htmlFor="notif-time">
          DEFAULT REMINDER TIME
        </label>
        <input
          id="notif-time"
          type="time"
          className="settings-input settings-input-time"
          value={prefs.notifDefaultTime}
          onChange={handleTimeChange}
        />
        <p className="settings-hint">
          Tasks without a specific reminder time will use this default.
        </p>
      </div>

      <div className="settings-group">
        <div className="settings-group-label">DAILY DIGEST</div>
        <label className="settings-checkbox-label">
          <input
            type="checkbox"
            className="settings-checkbox"
            checked={prefs.notifDigest}
            onChange={handleDigestChange}
          />
          <span className="settings-checkbox-text">
            Send a daily summary notification each morning
          </span>
        </label>
      </div>

    </div>
  );
}

// ---------------------------------------------------------------------------
// WidgetSection
// ---------------------------------------------------------------------------

function WidgetSection() {
  const [copied, setCopied] = useState(false);

  const widgetUid = localStorage.getItem('widget-uid') ?? 'NOT SET';
  const apiUrl = `${window.location.origin}/api/widget-data?uid=${widgetUid}`;

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(apiUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [apiUrl]);

  const handleDownloadConfig = useCallback(() => {
    const config = {
      apiUrl,
      fields: {
        tasks:      'tasks',
        streak:     'streak',
        tasksDone:  'tasksDone',
        tasksTotal: 'tasksTotal',
        accent:     'accent',
      },
      refreshMinutes: 15,
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'daily-tasks-widget-config.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [apiUrl]);

  return (
    <div className="settings-section">

      {/* Widget ID */}
      <div className="settings-group">
        <div className="settings-group-label">YOUR WIDGET ID</div>
        <div className="widget-uid-display">
          {widgetUid}
        </div>
      </div>

      {/* API Endpoint */}
      <div className="settings-group">
        <div className="settings-group-label">API ENDPOINT</div>
        <div className="widget-api-row">
          <code className="widget-api-url">{apiUrl}</code>
          <button className="widget-copy-btn" onClick={handleCopy}>
            {copied ? 'COPIED' : 'COPY'}
          </button>
        </div>
      </div>

      {/* KWGT Setup */}
      <div className="settings-group">
        <div className="settings-group-label">KWGT WIDGET SETUP</div>
        <ol className="widget-steps">
          <li className="widget-step">Install KWGT Kustom Widget Maker from the Play Store.</li>
          <li className="widget-step">Add a KWGT widget to your home screen and open it.</li>
          <li className="widget-step">Add a JSON data source using the API endpoint above.</li>
          <li className="widget-step">Map the fields (tasks, streak, tasksDone, tasksTotal, accent) to your widget elements.</li>
          <li className="widget-step">Set the refresh interval to 15 minutes and save.</li>
        </ol>
        <button className="settings-btn" onClick={handleDownloadConfig}>
          DOWNLOAD CONFIG JSON
        </button>
      </div>

      {/* Widget Size Mockups */}
      <div className="settings-group">
        <div className="settings-group-label">WIDGET SIZES</div>
        <div className="widget-mockups-row">

          {/* Small mockup */}
          <div className="widget-mockup widget-mockup-sm">
            <div className="widget-mockup-screen">
              <div className="wm-streak">7</div>
              <div className="wm-streak-label">DAY STREAK</div>
              <div className="wm-count">4/6</div>
            </div>
            <div className="widget-mockup-label">SMALL</div>
          </div>

          {/* Medium mockup */}
          <div className="widget-mockup widget-mockup-md">
            <div className="widget-mockup-screen">
              <div className="wm-greeting">GOOD MORNING</div>
              <div className="wm-task-row">
                <span className="wm-task-dot" />
                <span className="wm-task-text">Review pull request</span>
              </div>
              <div className="wm-task-row">
                <span className="wm-task-dot" />
                <span className="wm-task-text">Team standup 10am</span>
              </div>
              <div className="wm-task-row wm-task-done">
                <span className="wm-task-dot wm-task-dot-done" />
                <span className="wm-task-text">Check emails</span>
              </div>
            </div>
            <div className="widget-mockup-label">MEDIUM</div>
          </div>

          {/* Large mockup */}
          <div className="widget-mockup widget-mockup-lg">
            <div className="widget-mockup-screen">
              <div className="wm-header-row">
                <span className="wm-greeting">TODAY</span>
                <span className="wm-streak-badge">7 DAY</span>
              </div>
              <div className="wm-task-row">
                <span className="wm-task-dot" />
                <span className="wm-task-text">Review pull request</span>
              </div>
              <div className="wm-task-row">
                <span className="wm-task-dot" />
                <span className="wm-task-text">Team standup 10am</span>
              </div>
              <div className="wm-task-row wm-task-done">
                <span className="wm-task-dot wm-task-dot-done" />
                <span className="wm-task-text">Check emails</span>
              </div>
              <div className="wm-task-row">
                <span className="wm-task-dot" />
                <span className="wm-task-text">Write weekly report</span>
              </div>
              <div className="wm-task-row wm-task-done">
                <span className="wm-task-dot wm-task-dot-done" />
                <span className="wm-task-text">Lunch with Alice</span>
              </div>
              <div className="wm-progress-bar">
                <div className="wm-progress-fill" style={{ width: '40%' }} />
              </div>
              <div className="wm-progress-label">2 / 5 COMPLETE</div>
            </div>
            <div className="widget-mockup-label">LARGE</div>
          </div>

        </div>
      </div>

    </div>
  );
}

// ---------------------------------------------------------------------------
// DataSection
// ---------------------------------------------------------------------------

function DataSection({ user }) {
  const [exporting, setExporting] = useState(false);
  const [clearing, setClearing] = useState(false);

  const handleExport = useCallback(async () => {
    if (!user) return;
    setExporting(true);
    try {
      const snap = await getDocs(collection(db, 'users', user.uid, 'tasks'));
      const tasks = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `daily-tasks-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }, [user]);

  const handleClearData = useCallback(async () => {
    const confirmed = window.confirm('DELETE ALL TASKS? This cannot be undone.');
    if (!confirmed) return;
    setClearing(true);
    try {
      // Actual deletion logic would go here — requires batched Firestore deletes.
      // Placeholder: log intent without destructive operation until wired up.
      console.warn('Clear all data confirmed — implement batch delete here.');
    } finally {
      setClearing(false);
    }
  }, []);

  return (
    <div className="settings-section">

      <div className="settings-group">
        <div className="settings-group-label">EXPORT ALL TASKS</div>
        <p className="settings-hint">
          Download all your tasks as a JSON file for backup or migration.
        </p>
        <button
          className="settings-btn"
          onClick={handleExport}
          disabled={exporting || !user}
        >
          {exporting ? 'EXPORTING...' : 'EXPORT JSON'}
        </button>
      </div>

      <div className="settings-group">
        <div className="settings-group-label">DANGER ZONE</div>
        <p className="settings-hint settings-hint-warn">
          Permanently deletes all tasks across every date. This action cannot be undone.
        </p>
        <button
          className="settings-btn settings-btn-danger"
          onClick={handleClearData}
          disabled={clearing || !user}
        >
          {clearing ? 'CLEARING...' : 'CLEAR ALL DATA'}
        </button>
      </div>

    </div>
  );
}

// ---------------------------------------------------------------------------
// AboutSection
// ---------------------------------------------------------------------------

function AboutSection() {
  return (
    <div className="settings-section">

      <div className="settings-group">
        <div className="settings-group-label">APPLICATION</div>
        <div className="about-row">
          <span className="about-key">VERSION</span>
          <span className="about-value">v1.1.0</span>
        </div>
        <div className="about-row">
          <span className="about-key">BUILD</span>
          <span className="about-value">STABLE</span>
        </div>
        <div className="about-row">
          <span className="about-key">PLATFORM</span>
          <span className="about-value">PWA</span>
        </div>
      </div>

      <div className="settings-group">
        <div className="settings-group-label">TECH STACK</div>
        <div className="about-row">
          <span className="about-key">FRONTEND</span>
          <span className="about-value">React 18</span>
        </div>
        <div className="about-row">
          <span className="about-key">BACKEND</span>
          <span className="about-value">Firebase (Firestore + Auth)</span>
        </div>
        <div className="about-row">
          <span className="about-key">HOSTING</span>
          <span className="about-value">Vercel</span>
        </div>
      </div>

      <div className="settings-group">
        <div className="settings-group-label">ABOUT</div>
        <p className="about-desc">
          Daily Tasks is a minimal, high-performance PWA for managing your day.
          Designed for focus, built for speed. All data syncs in real-time via
          Firebase and is stored securely under your account.
        </p>
      </div>

      <div className="settings-group">
        <div className="settings-group-label">SUPPORT</div>
        <a
          className="about-link"
          href="https://github.com/finleycopp39/daily-tasks/issues"
          target="_blank"
          rel="noopener noreferrer"
        >
          REPORT AN ISSUE
        </a>
      </div>

    </div>
  );
}

// ---------------------------------------------------------------------------
// SettingsPage (root export)
// ---------------------------------------------------------------------------

export default function SettingsPage({ user }) {
  const [section, setSection] = useState('appearance');

  return (
    <div className="settings-page">

      <div className="settings-page-header">
        <h2 className="settings-page-title">SETTINGS</h2>
        <span className="settings-page-sub">SYSTEM CONFIGURATION</span>
      </div>

      <div className="settings-tabs">
        {SECTIONS.map((s) => (
          <button
            key={s}
            className={`settings-tab${section === s ? ' active' : ''}`}
            onClick={() => setSection(s)}
          >
            {TAB_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="settings-body">
        {section === 'appearance'    && <AppearanceSection />}
        {section === 'profile'       && <ProfileSection />}
        {section === 'notifications' && <NotificationsSection />}
        {section === 'widget'        && <WidgetSection />}
        {section === 'data'          && <DataSection user={user} />}
        {section === 'about'         && <AboutSection />}
      </div>

    </div>
  );
}
