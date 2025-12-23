import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import {
  FaSearch,
  FaTrash,
  FaEye,
  FaFilter,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUsers,
  FaDollarSign,
  FaSpinner,
  FaIdCard,
  FaUser,
  FaPlane,
  FaCreditCard,
  FaCheckCircle,
  FaTimes
} from 'react-icons/fa';

const Bookings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [totalBookings, setTotalBookings] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [onConfirmAction, setOnConfirmAction] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
        if (!token) {
          setError('No authentication token found');
          setLoading(false);
          return;
        }

        const response = await axios.get(`${import.meta.env.VITE_BACKEND_BASEURL}/api/admin/bookings?limit=100000`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setBookings(response.data.bookings || []);
        setTotalBookings(response.data.bookings?.length || 0);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load bookings');
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter(booking => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      booking.user.toLowerCase().includes(term) ||
      booking.destination.toLowerCase().includes(term) ||
      booking.packageName?.toLowerCase().includes(term);

    const matchesStatus = filterStatus === 'all' || booking.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = bookings
    .filter(b => b.status.toLowerCase() === 'confirmed' && b.paymentStatus?.toLowerCase() === 'paid')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const handleViewBooking = booking => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const handleDeleteBooking = bookingId => {
    setConfirmMessage('Are you sure you want to delete this booking? This action cannot be undone.');
    setOnConfirmAction(() => async () => {
      try {
        const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
        await axios.delete(`${import.meta.env.VITE_BACKEND_BASEURL}/api/admin/bookings/${bookingId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookings(prev => prev.filter(b => b._id !== bookingId));
        setSuccessMessage('Booking deleted successfully.');
        setShowSuccessModal(true);
        setShowConfirmModal(false);
      } catch (err) {
        console.error('Error deleting booking:', err);
        setErrorMessage('Failed to delete booking. Please try again.');
        setShowErrorModal(true);
        setShowConfirmModal(false);
      }
    });
    setShowConfirmModal(true);
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    setUpdatingStatus(bookingId);
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_BACKEND_BASEURL}/api/admin/bookings/${bookingId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBookings(prev =>
        prev.map(b => (b._id === bookingId ? { ...b, status: newStatus } : b))
      );

      if (selectedBooking?._id === bookingId) {
        setSelectedBooking(prev => ({ ...prev, status: newStatus }));
      }

      setSuccessMessage('Booking status updated successfully.');
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error updating booking status:', err);
      setErrorMessage('Failed to update booking status. Please try again.');
      setShowErrorModal(true);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusColor = status => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getPaymentStatusColor = status => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'refunded': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Booking Management</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage travel bookings and reservations</p>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Revenue: <span className="font-semibold text-green-600">${totalRevenue.toLocaleString()}</span>
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <FaFilter className="text-gray-400" />
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredBookings.length} of {totalBookings} bookings
          </div>
        </div>

        {/* Bookings Table */}
        <main className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <FaSpinner className="animate-spin text-4xl text-blue-500" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading bookings...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-red-600 dark:text-red-400">{error}</div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Booking</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Destination</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Travel Date</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredBookings.map((booking, index) => (
                      <tr key={booking._id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{booking.user}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            <FaCalendarAlt className="mr-1" size={12} />
                            {booking.bookingDate}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{booking.packageName}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FaMapMarkerAlt className="text-gray-400 mr-2" size={14} />
                            <span className="text-sm text-gray-900 dark:text-white">{booking.destination}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{booking.travelDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <select
                              value={booking.status}
                              onChange={e => handleStatusUpdate(booking._id, e.target.value)}
                              disabled={updatingStatus === booking._id}
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border-0 ${getStatusColor(booking.status)}`}
                            >
                              <option value="pending">pending</option>
                              <option value="confirmed">confirmed</option>
                              <option value="cancelled">cancelled</option>
                            </select>
                            {updatingStatus === booking._id && <FaSpinner className="animate-spin ml-1 text-blue-500" />}
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(booking.paymentStatus)}`}>
                              {booking.paymentStatus || 'pending'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm font-medium text-gray-900 dark:text-white">
                            <span className="text-green-500 mr-1">$</span>
                            {booking.totalAmount.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button onClick={() => handleViewBooking(booking)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                              <FaEye size={16} />
                            </button>
                            <button onClick={() => handleDeleteBooking(booking._id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                              <FaTrash size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Booking Modal, Confirm, Error, Success modals stay mostly unchanged */}
      {/* Just make status and payment dynamic using selectedBooking.status and selectedBooking.paymentStatus */}
    </div>
  );
};

export default Bookings;
