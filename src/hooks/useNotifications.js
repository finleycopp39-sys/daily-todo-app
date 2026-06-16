import { useEffect, useRef } from 'react';

export function useNotifications(tasks) {
  const notifiedRef = useRef(new Set());

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const check = () => {
      if (!('Notification' in window) || Notification.permission !== 'granted') return;
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const today = now.toISOString().split('T')[0];

      tasks.forEach(task => {
        if (!task.reminderTime || task.completed) return;
        if (task.reminderTime !== currentTime) return;
        const isForToday = task.date === today;
        const isDaily = task.reminderRecurrence === 'daily';
        if (!isForToday && !isDaily) return;

        const key = `${task.id}-${today}-${currentTime}`;
        if (notifiedRef.current.has(key)) return;
        notifiedRef.current.add(key);

        new Notification('Daily Tasks — Reminder', {
          body: task.text,
          icon: '/icon-192.png',
          tag: key,
        });
      });
    };

    const id = setInterval(check, 30_000);
    check();
    return () => clearInterval(id);
  }, [tasks]);
}
