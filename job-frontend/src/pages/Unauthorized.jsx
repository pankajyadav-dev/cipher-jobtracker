import React from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle } from 'react-icons/fa';

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-primary">
      <div className="max-w-md w-full bg-white dark:bg-dark-secondary rounded-lg shadow-md p-8 text-center">
        <FaExclamationTriangle className="mx-auto h-16 w-16 text-red-500 dark:text-red-400 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-primary mb-4">Access Denied</h1>
        <p className="text-gray-600 dark:text-dark-secondary mb-6">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        <div className="space-y-3">
          <Link
            to="/"
            className="block w-full bg-blue-600 dark:bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            Go to Homepage
          </Link>
          <Link
            to="/dashboard"
            className="block w-full border border-gray-300 dark:border-dark-primary text-gray-700 dark:text-dark-secondary py-2 px-4 rounded-md hover:bg-gray-50 dark:hover:bg-dark-accent transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
