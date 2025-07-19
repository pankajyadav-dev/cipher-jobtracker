import React, { useEffect, useState } from 'react';
import { jobService } from '../services/jobService';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { FaBuilding, FaMapMarkerAlt, FaBriefcase, FaClock } from 'react-icons/fa';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const data = await jobService.getUserApplications(currentPage, 10);
        setApplications(data.applications);
        setPagination(data.pagination);
      } catch (err) {
        console.error('Error fetching applications:', err);
        toast.error('Failed to load applications');
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Applied': return 'bg-blue-100 text-blue-800';
      case 'Under Review': return 'bg-yellow-100 text-yellow-800';
      case 'Shortlisted': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Hired': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto dark:bg-gray-800 dark:text-gray-200 p-6">
      <div className="flex justify-between items-center mb-8 dark:text-gray-300">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-200">My Applications</h1>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {pagination.totalApplications} applications found
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 animate-pulse dark:bg-gray-700">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center dark:bg-gray-700">
          <p className="text-gray-600 mb-4 dark:text-gray-400">You haven't applied to any jobs yet.</p>
          <Link
            to="/jobs"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="space-y-4 dark:bg-gray-800">
          {applications.map((application) => (
            <div key={application.job._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow dark:bg-gray-700">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <Link to={`/jobs/${application.job._id}`} className="text-xl font-bold text-gray-900 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400">
                    {application.job.title}
                  </Link>
                  <div className="flex items-center space-x-4 text-gray-600 mt-2 dark:text-gray-400">
                    <div className="flex items-center dark:text-gray-300">
                      <FaBuilding className="mr-1 dark:text-gray-300" />
                      <span>{application.job.company}</span>
                    </div>
                    <div className="flex items-center dark:text-gray-300">
                      <FaMapMarkerAlt className="mr-1 dark:text-gray-300" />
                      <span>{application.job.location}</span>
                    </div>
                    <div className="flex items-center dark:text-gray-300">
                      <FaBriefcase className="mr-1 dark:text-gray-300" />
                      <span>{application.job.jobType}</span>
                    </div>
                    <div className="flex items-center dark:text-gray-300">
                      <FaClock className="mr-1 dark:text-gray-300" />
                      <span>{application.job.workMode}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex items-center space-x-2 dark:text-gray-300">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.application.status)}`}>
                    {application.application.status}
                  </span>
                </div>
              </div>
              
              <div className="border-t pt-4 dark:border-gray-600">
                <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                  <span>Applied on: {new Date(application.application.appliedAt).toLocaleDateString()}</span>
                  <Link
                    to={`/jobs/${application.job._id}`}
                    className="text-blue-600 hover:text-blue-700 font-medium dark:text-blue-400 dark:hover:text-blue-500"
                  >
                    View Job Details
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center dark:bg-gray-800">
              <nav className="flex space-x-2 dark:text-gray-300">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:hover:bg-gray-700 dark:disabled:bg-gray-600"
                >
                  Previous
                </button>
                
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 border rounded-md ${
                      page === currentPage
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:hover:bg-gray-700 dark:disabled:bg-gray-600"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyApplications;
