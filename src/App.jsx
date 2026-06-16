import { useState, useEffect, useMemo } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { ThemeProvider } from './contexts/ThemeContext';
import { useTasks } from './hooks/useTasks';
import { useWeekTasks } from './hooks/useWeekTasks';
import { useNotifications } from './hooks/useNotifications';
import Auth from './components/Auth';
import Header from './components/Header';
import AppNav from './components/AppNav';
import TaskInput from './components/TaskInput';
import TaskList from './components/TaskList';
import WeekView from './components/WeekView';
import ViewToggle from './components/ViewToggle';
import SortBar from './components/SortBar';
import DailySummary from './components/DailySummary';
import Suggestions from './components/Suggestions';
import StatsPage from './pages/StatsPage';
import GoalsPage from './pages/GoalsPage';
import SettingsPage from './pages/SettingsPage';

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function getWeekStart() {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const mon = new Date(d);
  mon.setDate(d.getDate() + diff);
  return mon.toISOString().split('T')[0];
}

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

function applySortMode(tasks, mode) {
  if (mode === 'priority') {
    return [...tasks].sort((a, b) =>
      (PRIORITY_ORDER[a.priority] ?? 3) - (PRIORITY_ORDER[b.priority] ?? 3)
    );
  }
  if (mode === 'time') {
    return [...tasks].sort((a, b) => {
      if (!a.reminderTime && !b.reminderTime) return 0;
      if (!a.reminderTime) return 1;
      if (!b.reminderTime) return -1;
      return a.reminderTime.localeCompare(b.reminderTime);
    });
  }
  return tasks;
}

function ensureWidgetUid() {
  let uid = localStorage.getItem('widget-uid');
  if (!uid) {
    uid = crypto.randomUUID();
    localStorage.setItem('widget-uid', uid);
  }
  return uid;
}

function AppShell() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const [page, setPage] = useState('tasks');
  const [view, setView] = useState('today');
  const [sortMode, setSortMode] = useState('manual');

  const today = getToday();
  const weekStart = useMemo(getWeekStart, []);

  const { tasks, addTask, addTaskToDate, toggleTask, deleteTask, carryOver, reorderTasks } = useTasks(user, today);
  const { tasksByDate, weekDates } = useWeekTasks(user, weekStart);

  useNotifications(tasks);

  useEffect(() => {
    return onAuthStateChanged(auth, u => {
      setUser(u);
      setAuthLoading(false);
    });
  }, []);

  // Sync widget data when tasks or user change
  useEffect(() => {
    if (!user || tasks === undefined) return;
    const uid = ensureWidgetUid();
    const done = tasks.filter(t => t.completed).length;
    const payload = {
      accent:     getComputedStyle(document.documentElement).getPropertyValue('--cyan').trim() || '#00d4ff',
      streak:     0, // streak calculated in StatsPage; use 0 as default for widget
      tasksTotal: tasks.length,
      tasksDone:  done,
      tasks:      tasks.slice(0, 7).map(t => ({ text: t.text, done: t.completed, priority: t.priority })),
    };
    fetch(`/api/widget-data?uid=${uid}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});
  }, [user, tasks]);

  // Ensure widget-uid exists on mount
  useEffect(() => { ensureWidgetUid(); }, []);

  if (authLoading) {
    return <div className="loading-screen"><div className="loading-spinner" /></div>;
  }

  if (!user) return <Auth />;

  const displayTasks = applySortMode(tasks, sortMode);
  const completedCount = tasks.filter(t => t.completed).length;
  const percentage = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="app-shell">
      <AppNav page={page} onSetPage={setPage} />

      <div className="app-main">
        <Header
          user={user}
          percentage={percentage}
          taskCount={tasks.length}
          onEndDay={() => setShowSummary(true)}
        />

        <main className="app-content" key={page}>
          {page === 'tasks' && (
            <>
              <ViewToggle view={view} onSetView={setView} />
              {view === 'today' ? (
                <>
                  <TaskInput onAdd={addTask} date={today} />
                  <SortBar sortMode={sortMode} onSetSortMode={setSortMode} />
                  <TaskList
                    tasks={displayTasks}
                    onToggle={toggleTask}
                    onDelete={deleteTask}
                    onReorder={reorderTasks}
                    sortMode={sortMode}
                  />
                  <Suggestions tasks={tasks} date={today} onAdd={addTask} />
                </>
              ) : (
                <WeekView
                  weekDates={weekDates}
                  tasksByDate={tasksByDate}
                  today={today}
                  onAddTask={addTaskToDate}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                />
              )}
            </>
          )}

          {page === 'goals'    && <GoalsPage />}
          {page === 'stats'    && <StatsPage user={user} />}
          {page === 'settings' && <SettingsPage user={user} />}
        </main>
      </div>

      {showSummary && (
        <DailySummary
          tasks={tasks}
          date={today}
          onClose={() => setShowSummary(false)}
          onCarryOver={carryOver}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  );
}
