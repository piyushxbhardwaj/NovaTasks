import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard (Placeholder)</h1>
      <p className="mb-4">Welcome, <span className="font-semibold text-brand-600">{user?.email}</span></p>
      <button 
        onClick={logout} 
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
