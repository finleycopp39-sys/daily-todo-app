import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

function getWeekDates(weekStart) {
  const dates = [];
  const start = new Date(weekStart + 'T12:00:00');
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

export function useWeekTasks(user, weekStart) {
  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);
  const [tasksByDate, setTasksByDate] = useState(() => {
    const init = {};
    weekDates.forEach(d => (init[d] = []));
    return init;
  });

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'users', user.uid, 'tasks'),
      where('date', '>=', weekDates[0]),
      where('date', '<=', weekDates[6])
    );
    return onSnapshot(q, snap => {
      const grouped = {};
      weekDates.forEach(d => (grouped[d] = []));
      snap.docs.forEach(docSnap => {
        const data = { id: docSnap.id, ...docSnap.data() };
        if (data.date in grouped) grouped[data.date].push(data);
      });
      Object.values(grouped).forEach(arr =>
        arr.sort((a, b) => (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0))
      );
      setTasksByDate(grouped);
    });
  }, [user, weekDates[0]]);

  return { tasksByDate, weekDates };
}
