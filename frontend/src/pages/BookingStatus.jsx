import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaRupeeSign, FaEdit, FaTrash, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';
import { useTheme } from '../Compoents/ThemeContext';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import Navbar from '../Compoents/Navbar';

const BookingStatus = () => {
  const { darkMode } = useTheme();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBooking, setEditingBooking] = useState(null);
  const [editForm, setEditForm] = useState({ travelers: '', specialRequests: '' });

  useEffect(() => {
    const init = async () => {
      // After Stripe success redirect, create booking in backend if we have pending data
      try {
        const params = new URLSearchParams(window.location.search);
        const success = params.get('success');

        const pending = localStorage.getItem('pendingBooking');
        const token = localStorage.getItem('token');

        if (success === 'true' && pending && token) {
          const bookingData = JSON.parse(pending);
          try {
            await axios.post(
              `${import.meta.env.VITE_BACKEND_BASEURL}/api/bookings`,
              bookingData,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            toast.success('Booking created successfully after payment.');
          } catch (err) {
            console.error('Error creating booking after Stripe payment:', err);
            toast.error('Payment succeeded but booking could not be saved.');
          } finally {
            localStorage.removeItem('pendingBooking');
          }
        }
      } catch (e) {
        console.error('Stripe booking init error:', e);
      }

      await fetchBookings();
    };

    init();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You must be logged in to view bookings');
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_BASEURL}/api/bookings/user`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Map populated fields from backend
      const formattedBookings = response.data.map((b) => {
        const destinationName =
          typeof b.destination === 'string'
            ? b.destination
            : b.destination?.name || 'Unknown Destination';

        const packageName =
          b.packageName ||
          (typeof b.destination === 'string'
            ? b.destination
            : b.destination?.name) ||
          'Unknown Package';

        return {
          ...b,
          destination: destinationName,
          packageName,
        };
      });

      setBookings(formattedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_BACKEND_BASEURL}/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setBookings(bookings.filter((b) => b._id !== bookingId));
      toast.success('Booking deleted successfully');
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast.error('Failed to delete booking');
    }
  };

  const handleEdit = (booking) => {
    setEditingBooking(booking._id);
    setEditForm({
      travelers: booking.travelers,
      specialRequests: booking.specialRequests || ''
    });
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_BACKEND_BASEURL}/api/bookings/${editingBooking}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setBookings(bookings.map((b) => (b._id === editingBooking ? { ...b, ...editForm } : b)));
      setEditingBooking(null);
      toast.success('Booking updated successfully');
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <FaCheckCircle className="text-green-500" />;
      case 'pending': return <FaClock className="text-yellow-500" />;
      case 'cancelled': return <FaTimesCircle className="text-red-500" />;
      default: return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className={`min-h-screen pt-24 pb-12 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <ToastContainer />
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Booking Status & History</h1>
            <p className="text-lg opacity-80">Manage your travel bookings and track their status</p>
          </motion.div>

          {bookings.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <FaCalendarAlt className="text-6xl mx-auto mb-4 opacity-50" />
              <h2 className="text-2xl font-semibold mb-2">No Bookings Found</h2>
              <p className="opacity-70">You haven't made any bookings yet.</p>
            </motion.div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {bookings.map((booking, index) => (
                <motion.div key={booking._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`rounded-2xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>

                  {/* Header */}
                  <div className={`p-6 ${darkMode ? 'bg-gray-700' : 'bg-linear-to-r from-blue-500 to-indigo-600'} text-white`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(booking.status)}
                        <div>
                          <h3 className="font-semibold text-lg">{booking.packageName}</h3>
                          <p className="text-sm opacity-90">Booking #{booking._id.slice(-6)}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <FaCalendarAlt className="text-blue-500" />
                      <div>
                        <p className="text-sm opacity-70">Travel Date</p>
                        <p className="font-medium">{new Date(booking.travelDate).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <FaMapMarkerAlt className="text-blue-500" />
                      <div>
                        <p className="text-sm opacity-70">Destination</p>
                        <p className="font-medium">{booking.destination}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <FaUsers className="text-blue-500" />
                      <div>
                        <p className="text-sm opacity-70">Travelers</p>
                        <p className="font-medium">{booking.travelers} {booking.travelers === 1 ? 'person' : 'people'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <FaRupeeSign className="text-blue-500" />
                      <div>
                        <p className="text-sm opacity-70">Total Amount</p>
                        <p className="font-medium">${booking.totalAmount?.toLocaleString() || 'N/A'}</p>
                      </div>
                    </div>

                    {booking.specialRequests && (
                      <div>
                        <p className="text-sm opacity-70 mb-1">Special Requests</p>
                        <p className="text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded">{booking.specialRequests}</p>
                      </div>
                    )}

                    {/* Edit Form */}
                    {editingBooking === booking._id && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="mt-4 p-4 border rounded-lg bg-gray-50 dark:bg-blue-900 border-gray-200 dark:border-blue-700 text-gray-800 dark:text-blue-200">
                        <h4 className="font-semibold mb-3">Edit Booking</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-blue-300">Number of Travelers</label>
                            <input type="number" value={editForm.travelers} min="1"
                              onChange={(e) => setEditForm({ ...editForm, travelers: e.target.value })}
                              className="w-full p-2 border border-gray-300 dark:border-blue-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-blue-800 text-gray-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-blue-300">Special Requests</label>
                            <textarea value={editForm.specialRequests} rows="3"
                              onChange={(e) => setEditForm({ ...editForm, specialRequests: e.target.value })}
                              className="w-full p-2 border border-gray-300 dark:border-blue-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-blue-800 text-gray-900 dark:text-white"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button onClick={handleUpdate} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Update</button>
                            <button onClick={() => setEditingBooking(null)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-6">
                      <button onClick={() => handleEdit(booking)} className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
                        <FaEdit /> Edit
                      </button>
                      <button onClick={() => handleDelete(booking._id)} className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BookingStatus;
