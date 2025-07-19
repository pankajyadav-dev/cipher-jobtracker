import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { jobService } from '../services/jobService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaMapMarkerAlt, FaBriefcase, FaClock, FaBuilding, FaCalendarAlt, FaMoneyBillWave, FaEye, FaArrowLeft, FaBookmark, FaRegBookmark, FaShare } from 'react-icons/fa';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    resume: ''
  });
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const data = await jobService.getJobById(id);
        setJob(data);
      } catch (error) {
        console.error('Error fetching job details:', error);
        toast.error('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    try {
      await jobService.applyForJob(id, applicationData);
      toast.success('Application submitted successfully!');
      setShowApplicationForm(false);
      setApplicationData({ coverLetter: '', resume: '' });
      const updatedJob = await jobService.getJobById(id);
      setJob(updatedJob);
    } catch (error) {
      console.error('Error applying for job:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit application';
      toast.error(errorMessage);
    } finally {
      setApplying(false);
    }
  };

  const handleApplicationChange = (e) => {
    const { name, value } = e.target;
    setApplicationData(prev => ({ ...prev, [name]: value }));
  };

  const canApply = user && user.type === 'USER' && job && job.postedBy._id !== user._id;
  const isJobPoster = user && job && job.postedBy._id === user._id;
  const userApplication = user && job && job.applications?.find(app => app.applicant._id === user._id);
  const hasApplied = !!userApplication;

  const handleSaveJob = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? 'Job removed from saved jobs' : 'Job saved successfully!');
  };

  const handleShareJob = () => {
    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: `Check out this job at ${job.company}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Job link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto text-center dark:bg-gray-800 dark:text-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
        <p className="text-gray-600 mb-6">The job you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate('/jobs')}
          className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          <FaArrowLeft className="inline mr-2" />
          Back to Jobs
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto dark:bg-gray-800 dark:text-gray-200 p-6">
      <button
        onClick={() => navigate('/jobs')}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors dark:text-blue-400 dark:hover:text-blue-500"
      >
        <FaArrowLeft className="mr-2" />
        Back to Jobs
      </button>

      <div className="bg-white rounded-lg shadow-md p-8 mb-6 dark:bg-gray-700">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 dark:text-gray-200">{job.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400">
              <div className="flex items-center">
                <FaBuilding className="mr-2 dark:text-gray-400" />
                <span className="font-semibold dark:text-gray-200">{job.company}</span>
              </div>
              <div className="flex items-center dark:text-gray-400">
                <FaMapMarkerAlt className="mr-2 dark:text-gray-400" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center dark:text-gray-400">
                <FaBriefcase className="mr-2 dark:text-gray-400" />
                <span>{job.jobType}</span>
              </div>
              <div className="flex items-center dark:text-gray-400">
                <FaClock className="mr-2 dark:text-gray-400" />
                <span>{job.workMode}</span>
              </div>
            </div>
          </div>
          <div className="text-right flex items-center space-x-4 dark:text-gray-300">
            <span className={`px-3 py-1 rounded-full text-sm ${
              job.featured ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700'
            } dark:bg-gray-600 dark:text-gray-200`}>
              {job.featured ? 'Featured' : 'Regular'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 dark:bg-gray-700">
          <div className="flex items-center dark:text-gray-300">
            <FaMoneyBillWave className="mr-2 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Salary</p>
              <p className="font-semibold text-green-600 dark:text-green-400">
                {job.salary?.min ? (
                  `${job.salary.min.toLocaleString()} - ${job.salary.max?.toLocaleString() || 'N/A'} ${job.salary.currency}`
                ) : (
                  'Not specified'
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center dark:text-gray-300">
            <FaCalendarAlt className="mr-2 text-blue-600 dark:text-blue-400 " />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Posted</p>
              <p className="font-semibold dark:text-gray-200">{new Date(job.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center dark:text-gray-300">
            <FaEye className="mr-2 text-purple-600 dark:text-purple-400" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Views</p>
              <p className="font-semibold dark:text-gray-200">{job.viewCount || 0}</p>
            </div>
          </div>
        </div>

        <div className="border-t pt-4 flex justify-between items-center dark:border-gray-600">
          <div className="flex space-x-3 dark:text-gray-300">
            {user && (
              <button
                onClick={handleSaveJob}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors dark:hover:bg-gray-600 dark:border-gray-500 dark:hover:text-gray-200"
              >
                {isSaved ? (
                  <FaBookmark className="mr-2 text-blue-600 dark:text-blue-400" />
                ) : (
                  <FaRegBookmark className="mr-2 dark:text-gray-400" />
                )}
                {isSaved ? 'Saved' : 'Save Job'}
              </button>
            )}
            <button
              onClick={handleShareJob}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors dark:hover:bg-gray-600 dark:border-gray-500 dark:hover:text-gray-200"
            >
              <FaShare className="mr-2 dark:text-gray-400" />
              Share
            </button>
          </div>
          {canApply && !hasApplied && (
            <button
              onClick={() => setShowApplicationForm(true)}
              className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition-colors font-semibold dark:bg-blue-600 dark:hover:bg-blue-700" 
            >
              Apply for this Job
            </button>
          )}
          {hasApplied && (
            <div className="bg-green-100 border border-green-200 rounded-md px-6 py-3 dark:bg-green-800 dark:border-green-700 dark:text-green-200">
              <p className="text-green-800 font-semibold dark:text-green-200">Application Submitted</p>
              <p className="text-sm text-green-600 dark:text-green-300">Status: {userApplication.status}</p>
              <p className="text-sm text-green-600 dark:text-green-300">Applied on: {new Date(userApplication.appliedAt).toLocaleDateString()}</p>
            </div>
          )}
          {isJobPoster && (
            <Link
              to={`/jobs/${job._id}/applications`}
              className="bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 transition-colors font-semibold inline-flex items-center dark:bg-green-600 dark:hover:bg-green-700"
            >
              <FaEye className="mr-2" />
              Manage Applications ({job.applications?.length || 0})
            </Link>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8 mb-6 dark:bg-gray-700">
        <h2 className="text-xl font-bold text-gray-900 mb-4 dark:text-gray-200">Job Description</h2>
        <div className="prose max-w-none dark:prose-invert">
          <p className="text-gray-700 whitespace-pre-wrap dark:text-gray-300">{job.description}</p>
        </div>

        {job.skills && job.skills.length > 0 && (
          <div className="mt-6 dark:bg-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 dark:text-gray-200">Required Skills</h3>
            <div className="flex flex-wrap gap-2 dark:bg-gray-700">
              {job.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full dark:bg-blue-600 dark:text-blue-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
        {job.requirements && job.requirements.length > 0 && (
          <div className="mt-6 dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 dark:text-gray-200">Requirements</h3>
            <ul className="list-disc list-inside space-y-2 dark:text-gray-300">
              {job.requirements.map((requirement, index) => (
                <li key={index} className="text-gray-700 dark:text-gray-300 ">{requirement}</li>
              ))}
            </ul>
          </div>
        )}

        {job.benefits && job.benefits.length > 0 && (
          <div className="mt-6 dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 dark:text-gray-200">Benefits</h3>
            <ul className="list-disc list-inside space-y-2 dark:text-gray-300">
              {job.benefits.map((benefit, index) => (
                <li key={index} className="text-gray-700 dark:text-gray-300">{benefit}</li>
              ))}
            </ul>
          </div>
        )}

        {job.applicationDeadline && (
          <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-md dark:bg-orange-900 dark:border-orange-800 dark:text-orange-200">
            <h3 className="text-lg font-semibold text-orange-800 mb-2 dark:text-orange-200">Application Deadline</h3>
            <p className="text-orange-700 dark:text-orange-300">
              {new Date(job.applicationDeadline).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-8 mb-6 dark:bg-gray-700">
        <h2 className="text-xl font-bold text-gray-900 mb-4 dark:text-gray-200  ">About the Company</h2>
        <div className="flex items-center space-x-4 mb-4 dark:text-gray-300">
          <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center dark:bg-blue-600 dark:text-blue-200">
            <FaBuilding className="text-blue-600 text-2xl dark:text-blue-200" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">{job.company}</h3>
            <p className="text-gray-600 dark:text-gray-300">Posted by: {job.postedBy.firstname} {job.postedBy.lastname}</p>
          </div>
        </div>
      </div>

      {showApplicationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 dark:bg-opacity-70">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 dark:bg-gray-800 dark:text-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 dark:text-gray-200">Apply for {job.title}</h2>
            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  Cover Letter
                </label>
                <textarea
                  name="coverLetter"
                  value={applicationData.coverLetter}
                  onChange={handleApplicationChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
                  placeholder="Tell us why you're interested in this position..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  Resume URL
                </label>
                <input
                  type="url"
                  name="resume"
                  value={applicationData.resume}
                  onChange={handleApplicationChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
                  placeholder="https://example.com/my-resume.pdf"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowApplicationForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors dark:hover:bg-gray-600 dark:border-gray-500 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  {applying ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetail;
