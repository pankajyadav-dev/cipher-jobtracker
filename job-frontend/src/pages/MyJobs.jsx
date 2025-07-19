import React, { useState, useEffect } from 'react';
import { jobService } from '../services/jobService';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaEye, FaUsers, FaPlus, FaBuilding, FaMapMarkerAlt, FaBriefcase, FaClock } from 'react-icons/fa';

const MyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchMyJobs = async () => {
      setLoading(true);
      try {
        const data = await jobService.getUserJobs(currentPage, 10);
        setJobs(data.jobs);
        setPagination(data.pagination);
      } catch (error) {
        console.error('Error fetching my jobs:', error);
        toast.error('Failed to load your jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchMyJobs();
  }, [currentPage]);

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await jobService.deleteJob(jobId);
        setJobs(jobs.filter(job => job._id !== jobId));
        toast.success('Job deleted successfully');
      } catch (error) {
        console.error('Error deleting job:', error);
        toast.error('Failed to delete job');
      }
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Published': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Closed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'Filled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Jobs</h1>
        <Link
          to="/post-job"
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors flex items-center"
        >
          <FaPlus className="mr-2" /> Post New Job
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : jobs.length > 0 ? (
        <div className="space-y-4">
          {jobs.map(job => (
            <div key={job._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border dark:border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <Link to={`/jobs/${job._id}`} className="text-xl font-bold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400">
                    {job.title}
                  </Link>
                  <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-300 mt-2">
                    <div className="flex items-center">
                      <FaBuilding className="mr-1" />
                      <span>{job.company}</span>
                    </div>
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="mr-1" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center">
                      <FaBriefcase className="mr-1" />
                      <span>{job.jobType}</span>
                    </div>
                    <div className="flex items-center">
                      <FaClock className="mr-1" />
                      <span>{job.workMode}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-700 line-clamp-3 mb-4">{job.description}</p>
              
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <FaEye className="mr-1" />
                    <span>{job.viewCount || 0} views</span>
                  </div>
                  <div className="flex items-center">
                    <FaUsers className="mr-1" />
                    <span>{job.applications?.length || 0} applications</span>
                  </div>
                  <span>Posted: {new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/jobs/${job._id}`}
                    className="text-blue-600 hover:text-blue-700 p-2 rounded-md hover:bg-blue-50 transition-colors"
                    title="View Job"
                  >
                    <FaEye />
                  </Link>
                  <Link
                    to={`/jobs/${job._id}/applications`}
                    className="text-purple-600 hover:text-purple-700 p-2 rounded-md hover:bg-purple-50 transition-colors"
                    title="Manage Applications"
                  >
                    <FaUsers />
                  </Link>
                  <button
                    onClick={() => handleDeleteJob(job._id)}
                    className="text-red-600 hover:text-red-700 p-2 rounded-md hover:bg-red-50 transition-colors"
                    title="Delete Job"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center dark:bg-gray-800">
          <p className="text-gray-600 mb-4 dark:text-gray-300">You haven't posted any jobs yet.</p>
          <Link
            to="/post-job"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600 flex items-center justify-center"
          >
            <FaPlus className="inline mr-2 dark:text-gray-300" /> Post Your First Job
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyJobs;
