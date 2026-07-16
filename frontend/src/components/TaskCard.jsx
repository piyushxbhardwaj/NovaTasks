import React from 'react';
import { Calendar, Trash2, Edit3, CheckCircle, Circle, AlertCircle } from 'lucide-react';

const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const TaskCard = ({ task, onToggleStatus, onEdit, onDelete }) => {
  const isCompleted = task.status === 'completed';
  const isOverdue = !isCompleted && task.due_date && new Date(task.due_date) < new Date();

  const priorityColors = {
    low: {
      dot: 'bg-slate-400 dark:bg-slate-500',
      bg: 'bg-slate-50 border-slate-100 text-slate-600 dark:bg-slate-900/50 dark:border-slate-800 dark:text-slate-400',
    },
    medium: {
      dot: 'bg-amber-500',
      bg: 'bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/20 dark:text-amber-400',
    },
    high: {
      dot: 'bg-rose-500',
      bg: 'bg-rose-50 border-rose-100 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/20 dark:text-rose-400',
    },
  };

  const currentPriority = priorityColors[task.priority] || priorityColors.medium;

  return (
    <div className={`group relative rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/50 ${
      isCompleted ? 'bg-slate-50/50 dark:bg-slate-900/20 opacity-75' : ''
    }`}>
      <div className="flex items-start space-x-3.5">
        <button
          onClick={() => onToggleStatus(task)}
          className={`mt-1 h-5 w-5 shrink-0 rounded-full transition-colors ${
            isCompleted 
              ? 'text-emerald-500 hover:text-emerald-600 dark:text-emerald-400' 
              : 'text-slate-300 hover:text-brand-500 dark:text-slate-700'
          }`}
        >
          {isCompleted ? (
            <CheckCircle className="h-5 w-5 fill-emerald-50 dark:fill-emerald-950/20" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </button>

        <div className="flex-1 space-y-1.5 min-w-0">
          <div className="flex items-start justify-between">
            <h4 className={`text-base font-semibold leading-snug break-words pr-12 text-slate-900 dark:text-slate-100 ${
              isCompleted ? 'line-through text-slate-400 dark:text-slate-500 font-normal' : ''
            }`}>
              {task.title}
            </h4>
            
            {/* Quick Action Buttons */}
            <div className="absolute top-4 right-4 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
              <button
                onClick={() => onEdit(task)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                title="Edit task"
              >
                <Edit3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                title="Delete task"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {task.description && (
            <p className={`text-sm text-slate-500 dark:text-slate-450 leading-relaxed line-clamp-3 whitespace-pre-line break-words ${
              isCompleted ? 'text-slate-400/80 dark:text-slate-600' : ''
            }`}>
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
            {/* Priority Badge */}
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-medium ${currentPriority.bg}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${currentPriority.dot}`} />
              <span className="capitalize">{task.priority}</span>
            </span>

            {/* Due Date Indicator */}
            {task.due_date && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border font-medium ${
                isOverdue 
                  ? 'bg-rose-50 border-rose-100 text-rose-700 dark:bg-rose-950/10 dark:border-rose-900/20 dark:text-rose-400' 
                  : 'bg-slate-50 border-slate-100 text-slate-500 dark:bg-slate-850 dark:border-slate-800 dark:text-slate-400'
              }`}>
                {isOverdue ? (
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                )}
                <span>
                  {isOverdue ? 'Overdue: ' : ''}
                  {formatDateTime(task.due_date)}
                </span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
