import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { 
  Plus, LogOut, Sun, Moon, Search, SlidersHorizontal, ListTodo,
  AlertCircle, Sparkles, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getTasks, createTask, updateTask, deleteTask } from '../api/tasks';
import StatsSummary from '../components/StatsSummary';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import ConfirmDialog from '../components/ConfirmDialog';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();

  // Search, filtering, and sorting state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all / pending / completed
  const [priorityFilter, setPriorityFilter] = useState('all'); // all / low / medium / high
  const [sortBy, setSortBy] = useState('created_at'); // created_at / due_date / priority / title
  const [sortOrder, setSortOrder] = useState('desc'); // asc / desc

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTaskId, setDeletingTaskId] = useState(null);

  // Dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const hasActiveFilters = !!(search || statusFilter !== 'all' || priorityFilter !== 'all' || sortBy !== 'created_at' || sortOrder !== 'desc');

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setSortBy('created_at');
    setSortOrder('desc');
    toast.success('Filters reset');
  };

  // Fetch tasks query
  const queryParams = {
    search: debouncedSearch || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    priority: priorityFilter === 'all' ? undefined : priorityFilter,
    sort_by: sortBy,
    sort_order: sortOrder,
  };

  const { data: apiResponse, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['tasks', queryParams],
    queryFn: () => getTasks(queryParams),
  });

  const tasks = apiResponse?.data || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Task created successfully');
        queryClient.invalidateQueries(['tasks']);
        setIsFormOpen(false);
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.detail || 'Failed to create task');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateTask(id, data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message || 'Task updated successfully');
        queryClient.invalidateQueries(['tasks']);
        setIsFormOpen(false);
        setEditingTask(null);
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.detail || 'Failed to update task');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Task deleted successfully');
        queryClient.invalidateQueries(['tasks']);
        setDeletingTaskId(null);
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.detail || 'Failed to delete task');
    },
  });

  // Action handlers
  const handleToggleStatus = (task) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    updateMutation.mutate({
      id: task.id,
      data: { status: nextStatus },
    });
  };

  const handleEditClick = (task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (taskId) => {
    setDeletingTaskId(taskId);
  };

  const handleFormSubmit = (formData) => {
    if (editingTask) {
      updateMutation.mutate({
        id: editingTask.id,
        data: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 transition-colors duration-200 dark:bg-slate-950">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-white shadow-md shadow-brand-500/20">
                <ListTodo className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                NovaTasks
              </span>
            </div>

            <div className="flex items-center space-x-4">
              {/* Dark mode switcher */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {/* User Email & Logout */}
              <div className="hidden items-center space-x-2 text-sm text-slate-600 dark:text-slate-450 md:flex">
                <span>{user?.email}</span>
                <span className="text-slate-300 dark:text-slate-700">|</span>
              </div>
              <button
                onClick={logout}
                className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-350 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-800"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Dashboard Container */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Greeting */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
              My Workspace
              <Sparkles className="h-5 w-5 text-indigo-500 animate-pulse" />
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Organize, track, and accomplish your tasks productively.
            </p>
          </div>
          <button
            onClick={() => {
              setEditingTask(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-1.5 self-start rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-600/10 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <Plus className="h-5 w-5" />
            Add Task
          </button>
        </div>

        {/* Stats Section */}
        <StatsSummary tasks={tasks} />

        {/* Filters and Search controls */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute top-3 left-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or description..."
                className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2 pl-9 pr-4 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:bg-slate-950"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-1.5">
                <SlidersHorizontal className="h-4 w-4 text-slate-400" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
                  Filters:
                </span>
                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="rounded-lg bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-450 dark:hover:bg-indigo-950/70 transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="rounded-lg border border-slate-350 bg-white px-3 py-1.5 text-sm focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-350"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>

              {/* Sort By Select */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border border-slate-350 bg-white px-3 py-1.5 text-sm focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-350"
              >
                <option value="created_at">Date Created</option>
                <option value="due_date">Due Date</option>
                <option value="priority">Priority Order</option>
                <option value="title">Alphabetical</option>
              </select>

              {/* Sort Order Toggle */}
              <button
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="rounded-lg border border-slate-350 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-350 dark:hover:bg-slate-900"
              >
                {sortOrder === 'desc' ? 'Descending' : 'Ascending'}
              </button>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800">
            {['all', 'pending', 'completed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`border-b-2 px-4 py-2.5 text-sm font-semibold capitalize transition-all ${
                  statusFilter === tab
                    ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-450 dark:hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Task Cards Grid */}
        <div>
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 w-full animate-pulse rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/50">
                  <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800"></div>
                  <div className="mt-3 h-3 w-5/6 rounded bg-slate-150 dark:bg-slate-800/80"></div>
                  <div className="mt-6 flex gap-2">
                    <div className="h-5 w-16 rounded bg-slate-200 dark:bg-slate-800"></div>
                    <div className="h-5 w-24 rounded bg-slate-200 dark:bg-slate-800"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-red-200 bg-red-50/50 p-12 text-center dark:border-red-900/20 dark:bg-red-950/5">
              <AlertCircle className="h-10 w-10 text-red-500" />
              <h3 className="mt-4 text-lg font-bold text-red-900 dark:text-red-400">Failed to load tasks</h3>
              <p className="mt-1 text-sm text-red-500">There was a problem communicating with the server.</p>
              <button 
                onClick={refetch}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                <RefreshCw className="h-4 w-4" /> Retry
              </button>
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-16 text-center dark:border-slate-800 dark:bg-slate-900/20">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-900 text-slate-400">
                <ListTodo className="h-8 w-8" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-slate-100">No tasks found</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                {debouncedSearch || priorityFilter !== 'all' || statusFilter !== 'all'
                  ? "We couldn't find any tasks matching your filter criteria. Try adjusting your filters."
                  : "Get started by creating your first task! Click the Add Task button above."}
              </p>
              {!debouncedSearch && priorityFilter === 'all' && statusFilter === 'all' && (
                <button
                  onClick={() => {
                    setEditingTask(null);
                    setIsFormOpen(true);
                  }}
                  className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  <Plus className="h-4 w-4" /> Create a task
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleStatus={handleToggleStatus}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Task Form Modal (Create & Edit) */}
      <TaskForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingTask}
      />

      {/* Task Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deletingTaskId !== null}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={() => deleteMutation.mutate(deletingTaskId)}
        onCancel={() => setDeletingTaskId(null)}
      />
    </div>
  );
};

export default Dashboard;
