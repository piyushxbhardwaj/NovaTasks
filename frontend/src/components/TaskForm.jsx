import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2 } from 'lucide-react';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().optional().or(z.literal('')),
  priority: z.enum(['low', 'medium', 'high']),
  due_date: z.string().optional().or(z.literal('')),
  status: z.enum(['pending', 'completed']).optional(),
});

const formatDateForInput = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  
  const pad = (num) => String(num).padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

const TaskForm = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      due_date: '',
      status: 'pending',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          title: initialData.title || '',
          description: initialData.description || '',
          priority: initialData.priority || 'medium',
          due_date: formatDateForInput(initialData.due_date),
          status: initialData.status || 'pending',
        });
      } else {
        reset({
          title: '',
          description: '',
          priority: 'medium',
          due_date: '',
          status: 'pending',
        });
      }
    }
  }, [isOpen, initialData, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = async (data) => {
    // If due_date is empty, send null. Otherwise, convert to ISO string.
    const formattedData = {
      ...data,
      due_date: data.due_date ? new Date(data.due_date).toISOString() : null,
    };
    await onSubmit(formattedData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm dark:bg-slate-950/60 animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="text-xl font-bold text-slate-950 dark:text-slate-50 mb-6">
          {isEdit ? 'Edit Task' : 'Create New Task'}
        </h3>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('title')}
              className={`mt-1.5 block w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:bg-slate-950 dark:text-slate-100 ${
                errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-850'
              }`}
              placeholder="Task summary"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Description
            </label>
            <textarea
              rows={3}
              {...register('description')}
              className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-850 dark:bg-slate-950 dark:text-slate-100"
              placeholder="Provide more context..."
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Priority
              </label>
              <select
                {...register('priority')}
                className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-850 dark:bg-slate-950 dark:text-slate-100"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Due Date
              </label>
              <div className="relative mt-1.5">
                <input
                  type="datetime-local"
                  {...register('due_date')}
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-850 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {isEdit && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Status
              </label>
              <select
                {...register('status')}
                className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-850 dark:bg-slate-950 dark:text-slate-100"
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/80"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {isEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
