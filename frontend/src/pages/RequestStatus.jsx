import React, { useState, useEffect } from 'react';
import { FaEye, FaClock, FaCheck, FaTimes } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import { useTheme } from '../Compoents/ThemeContext';
import Navbar from '../Compoents/Navbar';
import Footer from '../Compoents/Footer';

const RequestStatus = () => {
  const { darkMode } = useTheme();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUserRequests();
  }, []);

  const fetchUserRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_BASEURL}/api/user/requests`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }

      const data = await response.json();
      setRequests(data.requests || []);
    } catch (error) {
      toast.error('Failed to fetch requests');
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FaClock className="text-yellow-500" />;
      case 'approved':
        return <FaCheck className="text-green-500" />;
      case 'rejected':
        return <FaTimes className="text-red-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Navbar />
      <ToastContainer />
      <div className={`min-h-screen pt-20 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-black'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>My Requests</h1>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Track the status of your destination requests</p>
        </div>

        {/* 
         */}
        {loading ? (
          <div className={`flex justify-center items-center h-64 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-black'}`}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <div className={`${darkMode ? 'text-gray-400' : 'text-gray-400'} mb-4`}>
              <FaClock className="mx-auto h-12 w-12" />
            </div>
            <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>No requests yet</h3>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>You haven't submitted any destination requests yet.</p>
          </div>
        ) : (
          <div className={`rounded-xl shadow-sm border border-gray-200 overflow-hidden ${darkMode ? 'bg-gray-900 text-white' : 'bg-white'}`}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Destination
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Landscape
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Budget
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Duration
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Status
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Submitted
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`${darkMode ? 'bg-gray-900 divide-gray-700' : 'bg-white divide-gray-200'}`}>
                  {requests.map((request) => (
                    <tr key={request._id} className={`${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {request.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                          {request.landscape}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                          ${request.price}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                          {request.duration}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(request.status)}
                          <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                          {new Date(request.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewRequest(request)}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                          title="View Details"
                        >
                          <FaEye className="w-4 h-4 mr-1" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal for viewing request details */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-900 text-white' : 'bg-white '}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Request Details
              </h3>
              <button
                onClick={closeModal}
                className={`${darkMode ? 'text-gray-400 hover:text-gray-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Destination Name
                  </label>
                  <p className={`mt-1 text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedRequest.name}</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Landscape
                  </label>
                  <p className={`mt-1 text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedRequest.landscape}</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Budget
                  </label>
                  <p className={`mt-1 text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>${selectedRequest.price}</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Duration
                  </label>
                  <p className={`mt-1 text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedRequest.duration}</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Rating
                  </label>
                  <p className={`mt-1 text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedRequest.rating}</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Status
                  </label>
                  <div className="flex items-center mt-1">
                    {getStatusIcon(selectedRequest.status)}
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedRequest.status)}`}>
                      {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Description
                </label>
                <div
                  className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'} ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} p-3 rounded-lg max-h-40 overflow-y-auto`}
                  dangerouslySetInnerHTML={{ __html: selectedRequest.description }}
                />
              </div>

              {selectedRequest.image && (
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Image
                  </label>
                  <img
                    src={selectedRequest.image}
                    alt={selectedRequest.name}
                    className="w-full max-w-md h-48 object-cover rounded-lg"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Submitted On
                  </label>
                  <p className={`mt-1 text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {new Date(selectedRequest.createdAt).toLocaleDateString()} at {new Date(selectedRequest.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Last Updated
                  </label>
                  <p className={`mt-1 text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {new Date(selectedRequest.updatedAt).toLocaleDateString()} at {new Date(selectedRequest.updatedAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Popular
                </label>
                <p className={`mt-1 text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedRequest.popular ? 'Yes' : 'No'}
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={closeModal}
                className={`px-4 py-2 border rounded-lg transition-colors ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
      <Footer />
    </>
  );
};

export default RequestStatus;
