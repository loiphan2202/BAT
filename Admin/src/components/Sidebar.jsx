import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FaHome,
  FaUsers,
  FaClipboardList,
  FaMapMarkedAlt,
  FaPlus,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUser,
  FaEnvelope 
} from 'react-icons/fa';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(window.innerWidth >= 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 1024);
      if (width >= 1024) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    {
      path: '/dashboard',
      icon: FaHome,
      label: 'Home',
      badge: null
    },
    {
      path: '/users',
      icon: FaUsers,
      label: 'Users',
      badge: null
    },
    {
      path: '/bookings',
      icon: FaClipboardList,
      label: 'Bookings',
      badge: null
    },
    {
      path: '/requests',
      icon: FaEnvelope,
      label: 'Requests',
      badge: null
    },
    {
      path: '/destinations',
      icon: FaMapMarkedAlt,
      label: 'Destinations',
      badge: null
    },
    {
      path: '/add-destination',
      icon: FaPlus,
      label: 'Add Destination',
      badge: null
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/');
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white z-50 transition-all duration-300 ease-in-out shadow-2xl border-r border-gray-200 dark:border-gray-700
        ${isOpen ? 'w-57' : 'w-0 lg:w-20'}
        lg:relative lg:z-auto
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className={`flex items-center space-x-3 ${!isOpen && 'lg:justify-center'}`}>
            <div className="w-10 h-10 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <FaUser className="text-white" size={20} />
            </div>
            {isOpen && (
              <div>
                <h1 className="font-bold text-xl text-gray-900 dark:text-white">Travel Admin</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Management Portal</p>
              </div>
            )}
          </div>
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`
                      group flex items-center px-4 py-3 rounded-xl transition-all duration-200 relative
                      ${isActive
                        ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                      }
                      ${!isOpen && 'lg:justify-center lg:px-3'}
                    `}
                    title={!isOpen ? item.label : ''}
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      <div className={`relative ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-indigo-500'} transition-colors duration-200`}>
                        <Icon size={18} />
                        {item.badge && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                            {item.badge}
                          </span>
                        )}
                      </div>

                      {isOpen && (
                        <span className="font-medium ml-3 transition-opacity duration-200 truncate">
                          {item.label}
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="px-4 mt-18 space-y-2">
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`
              group flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200
              text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 border border-transparent hover:border-red-200 dark:hover:border-red-800
              ${!isOpen && 'lg:justify-center lg:px-3'}
            `}
            title={!isOpen ? 'Logout' : ''}
          >
            <div className="flex items-center flex-1 min-w-0">
              <FaSignOutAlt size={18} className="text-red-500 group-hover:text-red-600 transition-colors duration-200" />
              {isOpen && (
                <span className="font-medium ml-3 transition-opacity duration-200">
                  Logout
                </span>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-3 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200"
      >
        <FaBars size={18} />
      </button>
    </>
  );
};

export default Sidebar;
