import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function getDateStr(date) {
  return date.toISOString().split('T')[0];
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return getDateStr(d);
}

function getLast7Days(byDate) {
  return Array.from({ length: 7 }, (_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - idx));
    const dateStr = getDateStr(d);
    return {
      date: dateStr,
      day: DAY_NAMES[d.getDay()],
      done: byDate[dateStr]?.done ?? 0,
      total: byDate[dateStr]?.total ?? 0,
    };
  });
}

export function useStats(user) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    async function fetchStats() {
      setLoading(true);
      setError(null);
      try {
        const startDate = daysAgo(89);
        const today = getDateStr(new Date());

        const snap = await getDocs(query(
          collection(db, 'users', user.uid, 'tasks'),
          where('date', '>=', startDate),
          where('date', '<=', today),
        ));

        // Group by date: { [dateStr]: { total, done } }
        const byDate = {};
        snap.docs.forEach(d => {
          const t = d.data();
          if (!byDate[t.date]) byDate[t.date] = { total: 0, done: 0 };
          byDate[t.date].total++;
          if (t.completed) byDate[t.date].done++;
        });

        const todayHasDone = (byDate[today]?.done ?? 0) > 0;

        // Current streak: walk back from today (or yesterday if today unfinished)
        let currentStreak = 0;
        for (let i = todayHasDone ? 0 : 1; i < 90; i++) {
          const dateStr = daysAgo(i);
          if ((byDate[dateStr]?.done ?? 0) > 0) {
            currentStreak++;
          } else {
            break;
          }
        }

        // Longest streak: scan oldest→newest
        let longestStreak = currentStreak;
        let tempStreak = 0;
        for (let i = 89; i >= 0; i--) {
          const dateStr = daysAgo(i);
          if ((byDate[dateStr]?.done ?? 0) > 0) {
            tempStreak++;
            longestStreak = Math.max(longestStreak, tempStreak);
          } else {
            tempStreak = 0;
          }
        }

        const todayData = byDate[today] ?? { total: 0, done: 0 };
        const weekDayData = getLast7Days(byDate);
        const weekDone  = weekDayData.reduce((s, d) => s + d.done, 0);
        const weekTotal = weekDayData.reduce((s, d) => s + d.total, 0);
        const monthStart = today.slice(0, 8) + '01';
        const monthDone = Object.entries(byDate)
          .filter(([date]) => date >= monthStart)
          .reduce((s, [, d]) => s + d.done, 0);
        const weekRate = weekTotal > 0 ? Math.round((weekDone / weekTotal) * 100) : 0;

        // Most productive day-of-week (most tasks done on avg)
        const dowSums = Array(7).fill(null).map(() => ({ done: 0, days: 0 }));
        Object.entries(byDate).forEach(([date, data]) => {
          if (data.done > 0) {
            const dow = new Date(date + 'T12:00:00').getDay();
            dowSums[dow].done += data.done;
            dowSums[dow].days++;
          }
        });
        const bestDowIdx = dowSums.reduce((best, d, i) =>
          d.done > dowSums[best].done ? i : best, 0
        );
        const bestDay = dowSums[bestDowIdx].done > 0 ? DAY_NAMES[bestDowIdx] : null;

        setStats({
          currentStreak,
          longestStreak,
          todayDone: todayData.done,
          todayTotal: todayData.total,
          weekDone,
          weekTotal,
          monthDone,
          weekRate,
          bestDay,
          weekDayData,
          today,
        });
      } catch (err) {
        console.error('Stats error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [user]);

  return { stats, loading, error };
}
