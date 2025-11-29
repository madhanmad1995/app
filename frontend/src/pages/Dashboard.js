import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, UserCheck, UserX, Clock, DollarSign, Clipboard, FileText } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const StatCard = ({ title, value, icon: Icon, bgColor, testId }) => (
  <div data-testid={testId} className="bg-white border border-zinc-200 rounded-sm p-6">
    <div className="flex items-start justify-between">
      <div>
        <p className="body-font text-xs uppercase tracking-wide text-zinc-500 mb-2">{title}</p>
        <p className="heading-font text-4xl font-black text-zinc-900">{value}</p>
      </div>
      <div className={`p-3 rounded-sm ${bgColor}`}>
        <Icon size={24} strokeWidth={2} className="text-white" />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_workers: 0,
    present_today: 0,
    absent_today: 0,
    total_hours_today: 0,
    total_wages_today: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-zinc-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-zinc-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="heading-font text-4xl font-black text-zinc-900 mb-2">DASHBOARD</h1>
        <p className="body-font text-zinc-600">Real-time overview of your workforce</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Total Workers"
          value={stats.total_workers}
          icon={Users}
          bgColor="bg-zinc-800"
          testId="stat-total-workers"
        />
        <StatCard
          title="Present Today"
          value={stats.present_today}
          icon={UserCheck}
          bgColor="bg-green-600"
          testId="stat-present-today"
        />
        <StatCard
          title="Absent Today"
          value={stats.absent_today}
          icon={UserX}
          bgColor="bg-red-600"
          testId="stat-absent-today"
        />
        <StatCard
          title="Hours Today"
          value={<span className="mono-font">{stats.total_hours_today.toFixed(2)}</span>}
          icon={Clock}
          bgColor="bg-blue-600"
          testId="stat-hours-today"
        />
        <StatCard
          title="Wages Today"
          value={<span className="mono-font">₹{stats.total_wages_today.toFixed(2)}</span>}
          icon={DollarSign}
          bgColor="bg-primary"
          testId="stat-wages-today"
        />
      </div>

      <div className="mt-8 bg-white border border-zinc-200 rounded-sm p-6">
        <h2 className="heading-font text-xl font-bold text-zinc-900 mb-4 uppercase">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/workers"
            data-testid="quick-action-add-worker"
            className="p-4 border border-zinc-200 rounded-sm hover:border-primary hover:bg-zinc-50 transition-all"
          >
            <Users className="mb-2" size={20} />
            <p className="body-font font-semibold text-sm">Manage Workers</p>
            <p className="body-font text-xs text-zinc-500">Add or update worker details</p>
          </a>
          <a
            href="/attendance"
            data-testid="quick-action-mark-attendance"
            className="p-4 border border-zinc-200 rounded-sm hover:border-primary hover:bg-zinc-50 transition-all"
          >
            <Clipboard className="mb-2" size={20} />
            <p className="body-font font-semibold text-sm">Mark Attendance</p>
            <p className="body-font text-xs text-zinc-500">Clock in/out for workers</p>
          </a>
          <a
            href="/reports"
            data-testid="quick-action-view-reports"
            className="p-4 border border-zinc-200 rounded-sm hover:border-primary hover:bg-zinc-50 transition-all"
          >
            <FileText className="mb-2" size={20} />
            <p className="body-font font-semibold text-sm">View Reports</p>
            <p className="body-font text-xs text-zinc-500">Monthly wage summaries</p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;