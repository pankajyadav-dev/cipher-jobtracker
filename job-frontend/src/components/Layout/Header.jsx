import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMenu, FiX, FiUser, FiLogOut, FiBriefcase, FiPlus } from 'react-icons/fi';
import ThemeToggle from '../ThemeToggle';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header className="bg-white dark:bg-dark-secondary shadow-md sticky top-0 z-50 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-gray-800 dark:text-dark-primary">LinkUp</span>
          </Link>

          <nav className="hidden md:flex space-x-8">

            {isAuthenticated && (
              <>
                <Link to="/jobs" className="text-gray-700 dark:text-dark-secondary hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Find Jobs
                </Link>
                {user?.type === 'ADMIN' && (
                  <>
                    <Link to="/my-jobs" className="text-gray-700 dark:text-dark-secondary hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      My Jobs
                    </Link>
                    <Link to="/post-job" className="text-gray-700 dark:text-dark-secondary hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      Post Job
                    </Link>
                  </>
                )}

                {user?.type === 'USER' && (
                  <Link to="/my-applications" className="text-gray-700 dark:text-dark-secondary hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    My Applications
                  </Link>
                )}
              </>
            )}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center space-x-2 text-gray-700 dark:text-dark-secondary hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <FiUser className="h-5 w-5" />
                  <span>{user?.firstname} {user?.lastname}</span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-accent rounded-md shadow-lg py-1 z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-dark-secondary hover:bg-gray-100 dark:hover:bg-dark-secondary"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-dark-secondary hover:bg-gray-100 dark:hover:bg-dark-secondary"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-dark-secondary hover:bg-gray-100 dark:hover:bg-dark-secondary"
                    >
                      <FiLogOut className="inline mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 dark:text-dark-secondary hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>


          {/* <div className="md:hidden flex items-center space-x-2"> */}
          {/* <ThemeToggle className="md:hidden" /> */}
          {/* <button
              onClick={toggleMenu}
              className="text-gray-700 dark:text-dark-secondary hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {isMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button> */}
          {/* </div> */}
        </div>


        {isMenuOpen && (
          <div className="md:hidden bg-white dark:bg-dark-secondary border-t dark:border-dark-primary">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                to="/jobs"
                className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-dark-secondary hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-dark-accent rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Find Jobs
              </Link>
              {isAuthenticated && (
                <>

                  {user?.type === 'ADMIN' && (
                    <>
                      <Link
                        to="/my-jobs"
                        className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-dark-secondary hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-dark-accent rounded-md transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        My Jobs
                      </Link>
                      <Link
                        to="/post-job"
                        className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-dark-secondary hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-dark-accent rounded-md transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <FiPlus className="inline mr-2" />
                        Post Job
                      </Link>
                    </>
                  )}

                  {user?.type === 'USER' && (
                    <Link
                      to="/my-applications"
                      className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-dark-secondary hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-dark-accent rounded-md transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Applications
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-dark-secondary hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-dark-accent rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/dashboard"
                    className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-dark-secondary hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-dark-accent rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 dark:text-dark-secondary hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-dark-accent rounded-md transition-colors"
                  >
                    <FiLogOut className="inline mr-2" />
                    Logout
                  </button>
                </>
              )}
              {!isAuthenticated && (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-dark-secondary hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-dark-accent rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="block px-3 py-2 text-base font-medium bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
