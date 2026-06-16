import { useState, useEffect } from 'react';
import {
  collection, query, where, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

export function useTasks(user, date) {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'users', user.uid, 'tasks'),
      where('date', '==', date)
    );
    return onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      docs.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return a.createdAt.seconds - b.createdAt.seconds;
      });
      setTasks(docs);
    });
  }, [user, date]);

  const addTask = async (text, priority) => {
    await addDoc(collection(db, 'users', user.uid, 'tasks'), {
      text,
      priority,
      completed: false,
      date,
      createdAt: serverTimestamp(),
      carriedOver: false,
    });
  };

  const toggleTask = async (taskId, completed) => {
    await updateDoc(doc(db, 'users', user.uid, 'tasks', taskId), {
      completed: !completed,
    });
  };

  const deleteTask = async (taskId) => {
    await deleteDoc(doc(db, 'users', user.uid, 'tasks', taskId));
  };

  const carryOver = async (taskIds) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const toCarry = tasks.filter(t => taskIds.includes(t.id));
    for (const task of toCarry) {
      await addDoc(collection(db, 'users', user.uid, 'tasks'), {
        text: task.text,
        priority: task.priority,
        completed: false,
        date: tomorrowStr,
        createdAt: serverTimestamp(),
        carriedOver: true,
      });
    }
  };

  return { tasks, addTask, toggleTask, deleteTask, carryOver };
}
