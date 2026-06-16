import { useState } from 'react';
import TaskItem from './TaskItem';
import TaskInput from './TaskInput';

const DAY_NAMES = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export default function WeekView({ weekDates, tasksByDate, today, onAddTask, onToggle, onDelete }) {
  const [expandedDay, setExpandedDay] = useState(today);
  const [addingDay, setAddingDay] = useState(null);

  return (
    <div className="week-view">
      {weekDates.map((date, i) => {
        const dayTasks = tasksByDate[date] ?? [];
        const pending = dayTasks.filter(t => !t.completed).length;
        const done = dayTasks.filter(t => t.completed).length;
        const isToday = date === today;
        const isExpanded = expandedDay === date;
        const displayDate = new Date(date + 'T12:00:00');

        return (
          <div key={date} className={`week-day${isToday ? ' week-day-today' : ''}`}>
            <div
              className="week-day-header"
              onClick={() => setExpandedDay(isExpanded ? null : date)}
            >
              <div className="week-day-label">
                <span className="week-day-name">{DAY_NAMES[i]}</span>
                <span className="week-day-num">{displayDate.getDate()}</span>
                {isToday && <span className="week-today-badge">TODAY</span>}
              </div>
              <div className="week-day-meta">
                {pending > 0 && <span className="week-count pending-count">{pending} PENDING</span>}
                {done > 0 && <span className="week-count done-count">{done} DONE</span>}
                <span className="week-chevron">{isExpanded ? '−' : '+'}</span>
              </div>
            </div>

            {isExpanded && (
              <div className="week-day-body">
                {dayTasks.length > 0 ? (
                  <div className="week-tasks">
                    {dayTasks.map(t => (
                      <TaskItem key={t.id} task={t} onToggle={onToggle} onDelete={onDelete} />
                    ))}
                  </div>
                ) : (
                  <p className="week-empty">// NO TASKS ASSIGNED</p>
                )}

                {addingDay === date ? (
                  <TaskInput
                    onAdd={(text, priority, reminderTime, recurrence) => {
                      onAddTask(text, priority, reminderTime, recurrence, date);
                      setAddingDay(null);
                    }}
                    date={date}
                    compact
                    onCancel={() => setAddingDay(null)}
                  />
                ) : (
                  <button className="week-add-btn" onClick={e => { e.stopPropagation(); setAddingDay(date); }}>
                    [ + ADD TASK ]
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
