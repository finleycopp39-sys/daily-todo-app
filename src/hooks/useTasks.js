import { useState, useEffect } from 'react';
import {
  collection, query, where, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

export function useTasks(user, date) {
  const [tasks, setTasks] = useState([]);
  const storageKey = user ? `task-order-${user.uid}-${date}` : null;

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'users', user.uid, 'tasks'),
      where('date', '==', date)
    );
    return onSnapshot(q, snap => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const saved = storageKey ? JSON.parse(localStorage.getItem(storageKey) ?? 'null') : null;
      if (saved) {
        docs.sort((a, b) => {
          const ai = saved.indexOf(a.id);
          const bi = saved.indexOf(b.id);
          if (ai === -1 && bi === -1) return (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0);
          if (ai === -1) return 1;
          if (bi === -1) return -1;
          return ai - bi;
        });
      } else {
        docs.sort((a, b) => (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0));
      }
      setTasks(docs);
    });
  }, [user, date]);

  const addTask = async (text, priority, reminderTime = null, reminderRecurrence = 'none') => {
    await addDoc(collection(db, 'users', user.uid, 'tasks'), {
      text, priority, completed: false, date,
      createdAt: serverTimestamp(), carriedOver: false,
      reminderTime: reminderTime || null,
      reminderRecurrence: reminderRecurrence || 'none',
    });
  };

  const addTaskToDate = async (text, priority, reminderTime = null, reminderRecurrence = 'none', targetDate) => {
    await addDoc(collection(db, 'users', user.uid, 'tasks'), {
      text, priority, completed: false, date: targetDate,
      createdAt: serverTimestamp(), carriedOver: false,
      reminderTime: reminderTime || null,
      reminderRecurrence: reminderRecurrence || 'none',
    });
  };

  const toggleTask = async (taskId, completed) => {
    await updateDoc(doc(db, 'users', user.uid, 'tasks', taskId), { completed: !completed });
  };

  const deleteTask = async (taskId) => {
    await deleteDoc(doc(db, 'users', user.uid, 'tasks', taskId));
    if (storageKey) {
      const saved = JSON.parse(localStorage.getItem(storageKey) ?? 'null');
      if (saved) localStorage.setItem(storageKey, JSON.stringify(saved.filter(id => id !== taskId)));
    }
  };

  const reorderTasks = (orderedIds) => {
    if (storageKey) localStorage.setItem(storageKey, JSON.stringify(orderedIds));
    setTasks(prev => {
      const map = Object.fromEntries(prev.map(t => [t.id, t]));
      return orderedIds.map(id => map[id]).filter(Boolean);
    });
  };

  const carryOver = async (taskIds) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const toCarry = tasks.filter(t => taskIds.includes(t.id));
    for (const task of toCarry) {
      await addDoc(collection(db, 'users', user.uid, 'tasks'), {
        text: task.text, priority: task.priority,
        completed: false, date: tomorrowStr,
        createdAt: serverTimestamp(), carriedOver: true,
        reminderTime: task.reminderTime ?? null,
        reminderRecurrence: task.reminderRecurrence ?? 'none',
      });
    }
  };

  return { tasks, addTask, addTaskToDate, toggleTask, deleteTask, carryOver, reorderTasks };
}
