import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import {
  FaSearch,
  FaEdit,
  FaTrash,
  FaPlus,
  FaMapMarkerAlt,
  FaStar,
  FaEye,
  FaFilter
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';

const Destinations = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMainCategory, setSelectedMainCategory] = useState('All');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [destinationToDelete, setDestinationToDelete] = useState(null);

  const mainCategories = [
    { name: "All", icon: "🌟", sub: null },
    { name: "Cost", icon: "💰", sub: ["Under $500", "$500-$700", "Over $700"] },
    { name: "Days", icon: "📅", sub: ["1-5 Days", "6-10 Days", "11+ Days"] },
    { name: "Landscape", icon: "🏞️", sub: ["Beach", "Mountain", "Heritage", "City"] }
  ];

  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
  const fetchDestinations = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_BASEURL}/api/admin/destinations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

        if (!response.ok) {
          throw new Error('Failed to fetch destinations');
        }

        const data = await response.json();
        setDestinations(data.destinations || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  const filteredDestinations = destinations.filter(destination => {
    const matchesSearch = destination.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      destination.description.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesFilter = true;
    if (selectedMainCategory !== 'All') {
      const mainCat = mainCategories.find(cat => cat.name === selectedMainCategory);
      if (mainCat && selectedSubCategory) {
        if (selectedMainCategory === 'Cost') {
          if (selectedSubCategory === 'Under $500') matchesFilter = destination.price < 500;
          else if (selectedSubCategory === '$500-$700') matchesFilter = destination.price >= 500 && destination.price <= 700;
          else if (selectedSubCategory === 'Over $700') matchesFilter = destination.price > 700;
        } else if (selectedMainCategory === 'Days') {
          const days = parseInt(destination.duration.split(' ')[0]);
          if (selectedSubCategory === '1-5 Days') matchesFilter = days >= 1 && days <= 5;
          else if (selectedSubCategory === '6-10 Days') matchesFilter = days >= 6 && days <= 10;
          else if (selectedSubCategory === '11+ Days') matchesFilter = days >= 11;
        } else if (selectedMainCategory === 'Landscape') {
          matchesFilter = destination.landscape === selectedSubCategory;
        }
      }
    }

    return matchesSearch && matchesFilter;
  });

  const handleViewDestination = (destination) => {
    setSelectedDestination(destination);
    setShowModal(true);
  };

  const handleEditDestination = (destination) => {
    // Navigate to add destination page with edit mode and destination data
    navigate('/add-destination', { state: { editMode: true, destination } });
  };

  const handleDeleteDestination = (destination) => {
    setDestinationToDelete(destination);
    setShowDeleteModal(true);
  };

  const confirmDeleteDestination = async () => {
    if (!destinationToDelete) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_BASEURL}/api/admin/destinations/${destinationToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });


      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete destination: ${response.status} ${errorText}`);
      }

      // Remove from local state only if deletion was successful
      setDestinations(destinations.filter(dest => dest._id !== destinationToDelete._id));
      toast.success('Destination deleted successfully');
      setShowDeleteModal(false);
      setDestinationToDelete(null);
    } catch (err) {
      toast.error(`Failed to delete destination. Error: ${err.message}`);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDestinationToDelete(null);
  };



  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <ToastContainer />
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Destination Management</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage travel destinations and packages</p>
              </div>
              <Link to='/add-destination'>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors">
                  <FaPlus className="mr-2" />
                  Add Destination
                </button>
              </Link>
            </div>
          </div>
        </header>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search destinations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center space-x-2">
                <FaFilter className="text-gray-400" />
                <select
                  value={selectedMainCategory}
                  onChange={(e) => {
                    setSelectedMainCategory(e.target.value);
                    setSelectedSubCategory('');
                  }}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {mainCategories.map(category => (
                    <option key={category.name} value={category.name}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
                {selectedMainCategory !== 'All' && mainCategories.find(cat => cat.name === selectedMainCategory)?.sub && (
                  <select
                    value={selectedSubCategory}
                    onChange={(e) => setSelectedSubCategory(e.target.value)}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select {selectedMainCategory}</option>
                    {mainCategories.find(cat => cat.name === selectedMainCategory).sub.map(sub => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredDestinations.length} of {destinations.length} destinations
            </div>
          </div>
        </div>

        {/* Destinations Grid */}
        <main className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-red-600 dark:text-red-400">Error: {error}</div>
            </div>
          ) : filteredDestinations.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-64 text-center">
              <div className="text-6xl mb-4">🏖️</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Destinations Found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {destinations.length === 0
                  ? "No destinations have been added yet. Click 'Add Destination' to get started."
                  : "No destinations match your current search or filter criteria. Try adjusting your filters."
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDestinations.map((destination, index) => (
                <div key={`${destination._id}-${index}`} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Image */}
                  <div className="relative h-48">
                    <img
                      src={destination.image || 'https://via.placeholder.com/400x300?text=No+Image'}
                      alt={destination.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                      }}
                    />
                    {destination.popular && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Popular
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs flex items-center">
                      <FaStar className="text-yellow-400 mr-1" size={10} />
                      {destination.rating}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{destination.name}</h3>
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                        {destination.landscape}
                      </span>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2" dangerouslySetInnerHTML={{ __html: destination.description }}>
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="mr-1" size={12} />
                        {destination.duration} days
                      </div>
                      <div className="font-semibold text-green-600 dark:text-green-400">
                        ${destination.price}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-start">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDestination(destination)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title="View Details"
                        >
                          <FaEye size={16} />
                        </button>
                        <button
                          onClick={() => handleEditDestination(destination)}
                          className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                          title="Edit Destination"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteDestination(destination)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete Destination"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Destination Details Modal */}
      {showModal && selectedDestination && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Destination Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="p-6">
                {/* Image */}
                <div className="mb-6">
                  <img
                    src={selectedDestination.image || 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={selectedDestination.name}
                    className="w-full h-64 object-cover rounded-xl"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                    }}
                  />
                </div>

                {/* Title and Basic Info */}
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{selectedDestination.name}</h1>
                  <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <FaMapMarkerAlt size={16} />
                      <span>{selectedDestination.landscape}</span>
                    </div>
                    <span>•</span>
                    <span>{selectedDestination.duration}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <FaStar className="text-yellow-500" size={16} />
                      <span>{selectedDestination.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Key Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Price</div>
                    <div className="text-xl font-bold text-green-600 dark:text-green-400">${selectedDestination.price}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Landscape</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">{selectedDestination.landscape}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Duration</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">{selectedDestination.duration}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</div>
                    <div className={`text-lg font-semibold ${selectedDestination.popular ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                      {selectedDestination.popular ? 'Popular' : 'Standard'}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Description</h3>
                  <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                    <div
                      className="text-gray-700 dark:text-gray-300 leading-relaxed prose max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: selectedDestination.description }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Last updated: {new Date().toLocaleDateString()}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => handleEditDestination(selectedDestination)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                >
                  <FaEdit size={16} />
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && destinationToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Confirm Delete</h3>
              <button
                onClick={cancelDelete}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <img
                  src={destinationToDelete.image || 'https://via.placeholder.com/400x300?text=No+Image'}
                  alt={destinationToDelete.name}
                  className="w-16 h-16 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                  }}
                />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{destinationToDelete.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{destinationToDelete.landscape}</p>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to delete this destination? This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteDestination}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Destinations;
