import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { toast } from 'react-toastify';
import { subDays, format } from 'date-fns';
import Navbar from '../components/Navbar';
import { analyticsService } from '../services/analyticsService';
import { useAuth } from '../context/AuthContext';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [productivity, setProductivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(30); // days

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const endDate = format(new Date(), 'yyyy-MM-dd');
      const startDate = format(subDays(new Date(), dateRange), 'yyyy-MM-dd');

      const [statsData, productivityData] = await Promise.all([
        analyticsService.getUserStats(user.id),
        analyticsService.getProductivity(user.id, startDate, endDate),
      ]);

      setStats(statsData);
      setProductivity(productivityData);
    } catch (error) {
      if (error.response?.status === 401) {
        // Token expired, redirect to login
        localStorage.clear();
        window.location.href = '/login';
      } else {
        // Show error but don't logout
        toast.error('Failed to fetch analytics');
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  const priorityChartData = {
    labels: ['Low', 'Medium', 'High'],
    datasets: [
      {
        label: 'Tasks by Priority',
        data: [
          stats?.byPriority?.Low || 0,
          stats?.byPriority?.Medium || 0,
          stats?.byPriority?.High || 0,
        ],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        borderColor: ['#059669', '#d97706', '#dc2626'],
        borderWidth: 1,
      },
    ],
  };

  const statusChartData = {
    labels: ['Todo', 'In Progress', 'Completed'],
    datasets: [
      {
        label: 'Tasks by Status',
        data: [stats?.pending || 0, stats?.inProgress || 0, stats?.completed || 0],
        backgroundColor: ['#6b7280', '#3b82f6', '#10b981'],
        borderColor: ['#4b5563', '#2563eb', '#059669'],
        borderWidth: 1,
      },
    ],
  };

  // Calculate cumulative completed tasks for trend line
  const cumulativeData = productivity?.series?.reduce((acc, item, index) => {
    const prevTotal = index > 0 ? acc[index - 1] : 0;
    acc.push(prevTotal + item.completed);
    return acc;
  }, []) || [];

  // Calculate remaining tasks (incomplete)
  const incompleteCount = (stats?.pending || 0) + (stats?.inProgress || 0);
  const remainingData = productivity?.series?.map(() => incompleteCount) || [];

  const productivityChartData = {
    labels: productivity?.series?.map((item) => format(new Date(item.date), 'MMM dd')) || [],
    datasets: [
      {
        label: 'Daily Completed',
        data: productivity?.series?.map((item) => item.completed) || [],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 6,
      },
      {
        label: 'Cumulative Progress',
        data: cumulativeData,
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        pointBackgroundColor: '#8b5cf6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 5,
        borderDash: [5, 5],
      },
      {
        label: 'Still Incomplete',
        data: remainingData,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        tension: 0,
        fill: true,
        pointRadius: 0,
        borderWidth: 2,
        borderDash: [10, 5],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <h3 className="text-xs font-medium opacity-90">Total Tasks</h3>
            <p className="text-2xl font-bold mt-1">{stats?.totalTasks || 0}</p>
          </div>

          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <h3 className="text-xs font-medium opacity-90">Completed</h3>
            <p className="text-2xl font-bold mt-1">{stats?.completed || 0}</p>
          </div>

          <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <h3 className="text-xs font-medium opacity-90">In Progress</h3>
            <p className="text-2xl font-bold mt-1">{stats?.inProgress || 0}</p>
          </div>

          <div className="card bg-gradient-to-br from-gray-500 to-gray-600 text-white">
            <h3 className="text-xs font-medium opacity-90">Todo</h3>
            <p className="text-2xl font-bold mt-1">{stats?.pending || 0}</p>
          </div>

          <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
            <h3 className="text-xs font-medium opacity-90">Incomplete</h3>
            <p className="text-2xl font-bold mt-1">{(stats?.pending || 0) + (stats?.inProgress || 0)}</p>
          </div>

          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <h3 className="text-xs font-medium opacity-90">Completion Rate</h3>
            <p className="text-2xl font-bold mt-1">{stats?.completionRate || 0}%</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Tasks by Priority</h2>
            <div className="h-64 flex items-center justify-center">
              <Pie data={priorityChartData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Tasks by Status</h2>
            <div className="h-64">
              <Bar
                data={statusChartData}
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { stepSize: 1 },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Productivity Chart */}
        <div className="card">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Productivity Trend</h2>
              <p className="text-sm text-gray-500 mt-1">Track your task completion over time</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setDateRange(7)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  dateRange === 7 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setDateRange(30)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  dateRange === 30 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                30 Days
              </button>
              <button
                onClick={() => setDateRange(90)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  dateRange === 90 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                90 Days
              </button>
            </div>
          </div>
          <div className="h-72">
            <Line
              data={productivityChartData}
              options={{
                maintainAspectRatio: false,
                responsive: true,
                interaction: {
                  mode: 'index',
                  intersect: false,
                },
                plugins: {
                  legend: {
                    position: 'top',
                    labels: {
                      usePointStyle: true,
                      padding: 20,
                    },
                  },
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 14 },
                    bodyFont: { size: 13 },
                    cornerRadius: 8,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { 
                      stepSize: 1,
                      font: { size: 11 },
                    },
                    grid: {
                      color: 'rgba(0, 0, 0, 0.05)',
                    },
                  },
                  x: {
                    ticks: {
                      font: { size: 11 },
                      maxRotation: 45,
                      minRotation: 0,
                    },
                    grid: {
                      display: false,
                    },
                  },
                },
              }}
            />
          </div>
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600">
                <strong className="text-gray-800">{productivity?.totalCompleted || 0}</strong> completed in {dateRange} days
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-sm text-gray-600">
                <strong className="text-gray-800">
                  {productivity?.series?.length > 0 
                    ? (productivity.totalCompleted / productivity.series.length).toFixed(1) 
                    : 0}
                </strong> avg/day
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm text-gray-600">
                <strong className="text-gray-800">{(stats?.pending || 0) + (stats?.inProgress || 0)}</strong> still incomplete
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm text-gray-600">
                <strong className="text-gray-800">{stats?.totalTasks || 0}</strong> total tasks
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
