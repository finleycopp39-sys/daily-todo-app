import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { useTasks } from './hooks/useTasks';
import Auth from './components/Auth';
import Header from './components/Header';
import TaskInput from './components/TaskInput';
import TaskList from './components/TaskList';
import DailySummary from './components/DailySummary';
import Suggestions from './components/Suggestions';

function getToday() {
  return new Date().toISOString().split('T')[0];
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const today = getToday();

  const { tasks, addTask, toggleTask, deleteTask, carryOver } = useTasks(user, today);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
  }, []);

  if (authLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!user) return <Auth />;

  const completedCount = tasks.filter(t => t.completed).length;
  const percentage = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="app">
      <Header
        user={user}
        percentage={percentage}
        taskCount={tasks.length}
        onEndDay={() => setShowSummary(true)}
      />
      <main className="main">
        <TaskInput onAdd={addTask} />
        <TaskList tasks={tasks} onToggle={toggleTask} onDelete={deleteTask} />
        <Suggestions tasks={tasks} date={today} onAdd={addTask} />
      </main>
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
