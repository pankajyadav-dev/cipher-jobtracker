import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { jobService } from '../services/jobService';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaUser, FaEnvelope, FaCalendarAlt, FaFileAlt, FaExternalLinkAlt, FaCheck, FaTimes, FaEye, FaHeart } from 'react-icons/fa';

const ManageApplications = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchJobApplications = async () => {
      setLoading(true);
      try {
        const data = await jobService.getJobApplications(jobId);
        setJob(data.job);
        setApplications(data.applications || []);
      } catch (error) {
        console.error('Error fetching applications:', error);
        toast.error('Failed to load applications');
      } finally {
        setLoading(false);
      }
    };

    fetchJobApplications();
  }, [jobId]);

  const handleChangeStatus = async (applicationId, newStatus) => {
    setUpdatingStatus(applicationId);
    try {
      await jobService.updateApplicationStatus(jobId, applicationId, newStatus);
      setApplications(applications.map(app =>
        app._id === applicationId ? { ...app, status: newStatus } : app
      ));
      toast.success(`Application status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Applied': return <FaFileAlt className="text-blue-600" />;
      case 'Under Review': return <FaEye className="text-yellow-600" />;
      case 'Shortlisted': return <FaCheck className="text-green-600" />;
      case 'Rejected': return <FaTimes className="text-red-600" />;
      case 'Hired': return <FaHeart className="text-purple-600" />;
      default: return <FaFileAlt className="text-gray-600" />;
    }
  };

  const filteredApplications = applications.filter(app => 
    filterStatus === 'all' || app.status === filterStatus
  );

  const statusOptions = ['Under Review', 'Shortlisted', 'Rejected', 'Hired'];

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto dark:bg-gray-800 dark:text-gray-200 p-6">

      <div className="mb-6 dark:text-gray-300">
        <button
          onClick={() => navigate('/my-jobs')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors dark:text-blue-400 dark:hover:text-blue-500"
        >
          <FaArrowLeft className="mr-2 dark:text-blue-400" />
          Back to My Jobs
        </button>
        
        <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-700">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 dark:text-gray-200">Manage Applications</h1>
          {job && (
            <div className="text-gray-600 dark:text-gray-400">
              <p className="text-xl font-semibold mb-1 dark:text-gray-200">{job.title}</p>
              <p className="dark:text-gray-400">{job.company} • {job.location}</p>
              <p className="text-sm mt-2 dark:text-gray-400">
                Total Applications: <span className="font-semibold dark:text-gray-200">{applications.length}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <div className="bg-white rounded-lg shadow-md p-4 dark:bg-gray-700 dark:text-gray-300">
          <div className="flex items-center space-x-4 dark:text-gray-300">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
            >
              <option value="all">All Applications</option>
              <option value="Applied">Applied</option>
              <option value="Under Review">Under Review</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Rejected">Rejected</option>
              <option value="Hired">Hired</option>
            </select>
            <span className="text-sm text-gray-500">({filteredApplications.length} results)</span>
          </div>
        </div>
      </div>

      {filteredApplications.length > 0 ? (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <div key={application._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow dark:bg-gray-700">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 dark:text-gray-300">

                <div className="lg:col-span-2 space-y-4 dark:text-gray-300">
                  <div className="flex items-center mb-4 dark:text-gray-300">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4 dark:bg-blue-600">
                      <FaUser className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-200 ">
                        {application.applicant.firstname} {application.applicant.lastname}
                      </h3>
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <FaEnvelope className="mr-2" />
                        <span>{application.applicant.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 dark:text-gray-300">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <FaCalendarAlt className="mr-2" />
                      <span>Applied: {new Date(application.appliedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center dark:text-gray-200">
                      {getStatusIcon(application.status)}
                      <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)} dark:bg-opacity-60`}>
                        {application.status}
                      </span>
                    </div>
                  </div>

                  {application.coverLetter && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 dark:text-gray-300">Cover Letter:</h4>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-md text-sm line-clamp-3 dark:bg-gray-800 dark:text-gray-300">
                        {application.coverLetter}
                      </p>
                    </div>
                  )}

                  {application.resume && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 dark:text-gray-300">Resume:</h4>
                      <a
                        href={application.resume}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors dark:text-blue-400 dark:hover:text-blue-500"
                      >
                        <FaExternalLinkAlt className="mr-2 dark:text-blue-400" />
                        View Resume
                      </a>
                    </div>
                  )}
                </div>

                <div className="lg:col-span-1">
                  <div className="bg-gray-50 rounded-lg p-4 dark:bg-gray-800 dark:text-gray-300">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 dark:text-gray-300">Update Status</h4>
                    <div className="space-y-2">
                      {statusOptions.map((status) => (
                        <button
                          key={status}
                          onClick={() => handleChangeStatus(application._id, status)}
                          disabled={updatingStatus === application._id || application.status === status}
                          className={`w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            application.status === status
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : 'bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50'
                          } dark:bg-blue-600 dark:hover:bg-blue-700 dark:disabled:bg-gray-600`}
                        >
                          {updatingStatus === application._id ? (
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 dark:border-gray-600"></div>
                              Updating...
                            </div>
                          ) : (
                            `Set ${status}`
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center dark:bg-gray-700 dark:text-gray-300">
          <div className="text-gray-400 mb-4">
            <FaFileAlt className="mx-auto text-4xl" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2 dark:text-gray-300">No Applications Found</h3>
          <p className="text-gray-600 mb-4 dark:text-gray-300">
            {filterStatus === 'all' 
              ? 'No one has applied for this job yet.'
              : `No applications with status "${filterStatus}" found.`
            }
          </p>
          <Link
            to={`/jobs/${jobId}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors dark:text-blue-400 dark:hover:text-blue-500"
          >
            <FaExternalLinkAlt className="mr-2 dark:text-blue-400" />
            View Job Posting
          </Link>
        </div>
      )}
    </div>
  );
};

export default ManageApplications;

