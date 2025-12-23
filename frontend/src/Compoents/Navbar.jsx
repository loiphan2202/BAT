import React, { useState, useEffect } from 'react';
import {
  FaBars, FaTimes, FaSun, FaMoon,
  FaUser, FaChevronDown, FaSignOutAlt
} from 'react-icons/fa';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from './ThemeContext';
import axios from 'axios';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    if (token) {
      axios
        .get(`${import.meta.env.VITE_BACKEND_BASEURL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => setUser(response.data))
        .catch((error) => console.error('Error fetching user data:', error));
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <div>
      <header
        className={`${isScrolled
          ? darkMode
            ? 'bg-black/80 backdrop-blur-md shadow-lg'
            : 'bg-green-50/80 backdrop-blur-md shadow-lg'
          : 'bg-transparent'}
          ${darkMode ? 'text-white' : 'text-black'}
          fixed top-0 left-0 right-0 z-50 transition-all duration-300`}
      >
        <div
          className="container mx-auto flex items-center justify-between h-20 px-4"
          onClick={() => setIsDropdownOpen(false)}
          >

          {/* Logo */}
          {darkMode ?
            <Link to="/home" className="flex items-center space-x-3">
              <img className="h-30 w-auto" src="/logo_white.png" alt="logo" />
            </Link> :
            <Link to="/home" className="flex items-center space-x-3">
              <img className="h-30 w-auto" src="/logo_black.png" alt="logo" />
            </Link>}

          {/* Desktop Nav */}
          <nav className="hidden md:flex">
            <ul className="flex items-center space-x-8">
              {[
                { name: 'Home', path: 'home' },
                { name: 'About', path: 'about' },
                { name: 'Destination', path: 'destination' },
                { name: 'Booking Status', path: 'booking-status' },
                { name: 'Request Status', path: 'request-status' }
              ].map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={`/${item.path}`}
                    className={({ isActive }) =>
                      `text-lg font-medium transition-colors duration-300 relative group px-3 py-2  hover:bg-lime-400/10 ${isActive
                        ? 'text-lime-400 border-b-2 border-lime-400'
                        : darkMode ? 'text-gray-200 hover:text-lime-400' : 'text-gray-800 hover:text-lime-400'
                      }`
                    }
                  >
                    <span>{item.name}</span>
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-lime-400 transition-all duration-300 group-hover:w-full"></span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="hidden md:block text-yellow-400 text-2xl focus:outline-none mr-4"
            aria-label="Toggle theme"
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>

          {/* Profile Dropdown */}
          {isLoggedIn ? (
            <div className="hidden md:block relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDropdownOpen(!isDropdownOpen);
                }}
                className={`flex items-center space-x-2 ${darkMode
                    ? 'bg-linear-to-r from-gray-800 to-gray-900 text-white'
                    : 'bg-linear-to-r from-gray-100 to-gray-200 text-gray-800'
                  } font-semibold px-4 py-2 rounded-full shadow-md hover:scale-105 transition-all duration-300`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${darkMode
                      ? 'bg-linear-to-r from-lime-400 to-green-500 text-black'
                      : 'bg-linear-to-r from-lime-500 to-green-600 text-white'
                    }`}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : <FaUser />}
                </div>
                <FaChevronDown
                  className={`transform transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''
                    }`}
                />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="absolute right-0 mt-3 w-64 z-50"
                  >
                    {/* Arrow Pointer */}
                    <div
                      className={`absolute right-6 -top-2 w-4 h-4 rotate-45 ${darkMode
                          ? 'bg-gray-900 border-t border-l border-gray-700'
                          : 'bg-white border-t border-l border-gray-200'
                        }`}
                    ></div>

                    {/* Dropdown Box */}
                    <div
                      className={`rounded-2xl shadow-2xl py- border backdrop-blur-xl ${darkMode
                          ? 'bg-gray-900/90 border-gray-700 text-white'
                          : 'bg-white/90 border-gray-200 text-gray-800'
                        }`}
                    >
                      <div
                        className={`px-5 py-3 rounded-t-2xl ${darkMode
                            ? 'bg-gray-800/70 border-b border-gray-700'
                            : 'bg-gray-100/70 border-b border-gray-200'
                          }`}
                      >
                        <p className="text-sm font-semibold">
                          {user?.name || 'Guest User'}
                        </p>
                        <p
                          className={`text-xs mt-1 px-2 py-1 inline-block rounded ${darkMode
                              ? 'bg-gray-700 text-gray-300'
                              : 'bg-gray-200 text-gray-700'
                            }`}
                        >
                          {user?.email || 'user@example.com'}
                        </p>
                      </div>

                      <button
                        onClick={handleLogout}
                        className={`w-full text-left flex items-center gap-2 px-5 py-3 text-sm transition-all duration-300 rounded-b-2xl ${darkMode
                            ? 'text-red-400 hover:bg-gray-800 hover:text-red-500'
                            : 'text-red-500 hover:bg-gray-100'
                          }`}
                      >
                        <FaSignOutAlt /> Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="hidden md:block bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-6 py-2 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Login
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white text-2xl focus:outline-none"
            onClick={toggleMenu}
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`md:hidden ${darkMode ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-md border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
            >
              <div className="container mx-auto px-4 py-4">
                {/* Mobile Nav Links */}
                <nav className="mb-4">
                  <ul className="space-y-2">
                    {[
                      { name: 'Home', path: 'home' },
                      { name: 'About', path: 'about' },
                      { name: 'Destination', path: 'destination' },
                      { name: 'Booking Status', path: 'booking-status' },
                      { name: 'Request Status', path: 'request-status' }
                    ].map((item) => (
                      <li key={item.path}>
                        <NavLink
                          to={`/${item.path}`}
                          onClick={() => setIsOpen(false)}
                          className={({ isActive }) =>
                            `block py-3 px-4 rounded-lg transition-colors duration-300 ${isActive
                              ? 'text-lime-400 bg-lime-400/10'
                              : darkMode ? 'text-gray-200 hover:text-lime-400 hover:bg-lime-400/10' : 'text-gray-800 hover:text-lime-400 hover:bg-lime-400/10'
                            }`
                          }
                        >
                          {item.name}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </nav>

                {/* Mobile Theme Toggle */}
                <div className="flex items-center justify-between py-3 px-4 border-t border-b border-gray-200 dark:border-gray-700">
                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    Theme
                  </span>
                  <button
                    onClick={toggleTheme}
                    className={`flex items-center gap-3 p-2 rounded-lg transition-colors duration-300 ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                      }`}
                    aria-label="Toggle theme"
                  >
                    {darkMode ? <FaSun className="text-yellow-400 text-xl" /> : <FaMoon className="text-yellow-400 text-xl" />}
                    <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {darkMode ? 'Light' : 'Dark'}
                    </span>
                  </button>
                </div>

                {/* Mobile Auth Section */}
                <div className="pt-4">
                  {isLoggedIn ? (
                    <div className="space-y-3">
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        <p className="font-semibold text-sm">
                          {user?.name || 'Guest User'}
                        </p>
                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {user?.email || 'user@example.com'}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsOpen(false);
                        }}
                        className="w-full flex items-center gap-2 py-3 px-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-300"
                      >
                        <FaSignOutAlt /> Logout
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        navigate('/login');
                        setIsOpen(false);
                      }}
                      className="w-full bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg shadow-lg transition-all duration-300"
                    >
                      Login
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </div>
  );
}

export default Navbar;
