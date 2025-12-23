import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import {
  FaUsers,
  FaClipboardList,
  FaMapMarkedAlt,
  FaRupeeSign,
  FaChartLine,
  FaCalendarAlt,
  FaSpinner
} from 'react-icons/fa';

const Dashboard = () => {
  const [stats, setStats] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) throw new Error('No admin token found');

        // Fetch stats
        const statsRes = await fetch(
          `${import.meta.env.VITE_BACKEND_BASEURL}/api/admin/stats`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!statsRes.ok) throw new Error('Failed to fetch stats');
        const statsJson = await statsRes.json();

        // Map stats
        const mappedStats = [
          { title: 'Total Users', value: statsJson.totalUsers?.toString() || '0', icon: FaUsers, color: 'bg-blue-500', change: statsJson.usersChange || '+0%' },
          { title: 'Total Bookings', value: statsJson.totalBookings?.toString() || '0', icon: FaClipboardList, color: 'bg-green-500', change: statsJson.bookingsChange || '+0%' },
          { title: 'Destinations', value: statsJson.totalDestinations?.toString() || '0', icon: FaMapMarkedAlt, color: 'bg-purple-500', change: statsJson.destinationsChange || '+0%' },
          { title: 'Revenue', value: `$${statsJson.totalRevenue?.toString() || '0'}`, icon: FaRupeeSign, color: 'bg-yellow-500', change: statsJson.revenueChange || '+0%' }
        ];
        setStats(mappedStats);

        // Fetch recent bookings
        const recentRes = await fetch(
          `${import.meta.env.VITE_BACKEND_BASEURL}/api/admin/bookings/recent`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!recentRes.ok) throw new Error('Failed to fetch recent bookings');
        const recentJson = await recentRes.json();
        setRecentBookings(recentJson || []);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Welcome back! Here's what's happening with your travel platform.</p>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <FaSpinner className="animate-spin text-4xl text-blue-500" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading dashboard data...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-400">Error loading dashboard data: {error}</p>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                          <p className="text-sm text-green-600 dark:text-green-400 mt-1">{stat.change} from last month</p>
                        </div>
                        <div className={`p-3 rounded-lg ${stat.color}`}>
                          <Icon className="text-white" size={20} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Recent Bookings */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
                  <FaCalendarAlt className="mr-2 text-gray-500" /> Recent Bookings
                </h3>
                {recentBookings.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center">No recent bookings found</p>
                ) : (
                  <div className="space-y-4">
                    {recentBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{booking.user}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{booking.destination}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600 dark:text-gray-400">{booking.date || booking.travelDate}</p>
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                            booking.status === 'confirmed'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : booking.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          }`}>{booking.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
