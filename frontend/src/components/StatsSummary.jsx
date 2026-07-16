import React from 'react';
import { ClipboardList, Hourglass, CheckCircle2 } from 'lucide-react';

const StatsSummary = ({ tasks = [] }) => {
  const total = tasks.length;
  const pending = tasks.filter((t) => t.status === 'pending').length;
  const completed = tasks.filter((t) => t.status === 'completed').length;

  const cards = [
    {
      label: 'Total Tasks',
      value: total,
      icon: ClipboardList,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/30',
      borderColor: 'border-indigo-100 dark:border-indigo-900/20',
    },
    {
      label: 'Pending',
      value: pending,
      icon: Hourglass,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30',
      borderColor: 'border-amber-100 dark:border-amber-900/20',
    },
    {
      label: 'Completed',
      value: completed,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
      borderColor: 'border-emerald-100 dark:border-emerald-900/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`flex items-center justify-between rounded-2xl border ${card.borderColor} ${card.bgColor} p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`}
          >
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
                {card.label}
              </span>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {card.value}
              </p>
            </div>
            <div className={`rounded-xl p-3 bg-white dark:bg-slate-900 border ${card.borderColor} shadow-sm`}>
              <Icon className={`h-6 w-6 ${card.color}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsSummary;
