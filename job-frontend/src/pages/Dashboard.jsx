import React, { useEffect, useState } from 'react';
import { dashboardService } from '../services/dashboardService';
import { useAuth } from '../context/AuthContext';
import { FaBriefcase, FaUsers, FaEye, FaChartLine, FaFile, FaCheckCircle, FaClock } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await dashboardService.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 dark:border-blue-400"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-primary mb-8">Dashboard</h1>
        <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600 dark:text-dark-muted">No dashboard data available. Please check your connection and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-primary mb-8">Dashboard</h1>
      {user.type === 'ADMIN' ? (
        <AdminDashboard stats={stats} />
      ) : (
        <UserDashboard stats={stats} />
      )}
    </div>
  );
};

const AdminDashboard = ({ stats }) => {
  const overview = stats?.overview || { totalJobs: 0, publishedJobs: 0, totalApplications: 0, draftJobs: 0 };
  const applicationStats = stats?.applicationStats || [];
  const recentApplications = stats?.recentApplications || [];
  const topPerformingJobs = stats?.topPerformingJobs || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <FaBriefcase className="text-blue-500 dark:text-blue-400 text-2xl mr-3" />
            <div>
              <p className="text-sm text-gray-600 dark:text-dark-muted">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-dark-primary">{overview.totalJobs || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <FaCheckCircle className="text-green-500 dark:text-green-400 text-2xl mr-3" />
            <div>
              <p className="text-sm text-gray-600 dark:text-dark-muted">Published</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-dark-primary">{overview.publishedJobs || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <FaUsers className="text-purple-500 dark:text-purple-400 text-2xl mr-3" />
            <div>
              <p className="text-sm text-gray-600 dark:text-dark-muted">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-dark-primary">{overview.totalApplications || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <FaFile className="text-orange-500 dark:text-orange-400 text-2xl mr-3" />
            <div>
              <p className="text-sm text-gray-600 dark:text-dark-muted">Draft Jobs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-dark-primary">{overview.draftJobs || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-dark-primary mb-4">Application Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {applicationStats.map((stat) => (
            <div key={stat._id} className="text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stat.count}</p>
              <p className="text-sm text-gray-600 dark:text-dark-muted capitalize">{stat._id}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-dark-primary mb-4">Recent Applications</h2>
        <div className="space-y-3">
          {recentApplications.slice(0, 5).map((app, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-accent rounded-lg">
              <div>
                <p className="font-semibold text-gray-900 dark:text-dark-primary">{app.title}</p>
                <p className="text-sm text-gray-600 dark:text-dark-muted">{app.applicant.firstname} {app.applicant.lastname}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-dark-muted">{new Date(app.application.appliedAt).toLocaleDateString()}</p>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  app.application.status === 'Applied' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300' :
                  app.application.status === 'Under Review' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300' :
                  app.application.status === 'Shortlisted' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300' :
                  'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300'
                }`}>
                  {app.application.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-dark-primary mb-4">Top Performing Jobs</h2>
        <div className="space-y-3">
          {topPerformingJobs.map((job, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-accent rounded-lg">
              <div>
                <p className="font-semibold text-gray-900 dark:text-dark-primary">{job.title}</p>
                <p className="text-sm text-gray-600 dark:text-dark-muted">{job.company}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <FaEye className="text-gray-500 dark:text-gray-400 mr-1" />
                  <span className="text-sm text-gray-900 dark:text-dark-secondary">{job.viewCount}</span>
                </div>
                <div className="flex items-center">
                  <FaUsers className="text-gray-500 dark:text-gray-400 mr-1" />
                  <span className="text-sm text-gray-900 dark:text-dark-secondary">{job.applicationCount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const UserDashboard = ({ stats }) => {
  const overview = stats?.overview || { totalApplications: 0, applicationStats: {} };
  const recentApplications = stats?.recentApplications || [];
  const applicationTrends = stats?.applicationTrends || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <FaFile className="text-blue-500 dark:text-blue-400 text-2xl mr-3" />
            <div>
              <p className="text-sm text-gray-600 dark:text-dark-muted">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-dark-primary">{overview.totalApplications || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <FaClock className="text-yellow-500 dark:text-yellow-400 text-2xl mr-3" />
            <div>
              <p className="text-sm text-gray-600 dark:text-dark-muted">Applied</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-dark-primary">{overview.applicationStats?.applied || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <FaChartLine className="text-purple-500 dark:text-purple-400 text-2xl mr-3" />
            <div>
              <p className="text-sm text-gray-600 dark:text-dark-muted">Under Review</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-dark-primary">{overview.applicationStats?.under_review || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <FaCheckCircle className="text-green-500 dark:text-green-400 text-2xl mr-3" />
            <div>
              <p className="text-sm text-gray-600 dark:text-dark-muted">Shortlisted</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-dark-primary">{overview.applicationStats?.shortlisted || 0}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-dark-primary mb-4">Recent Applications</h2>
        <div className="space-y-3">
          {recentApplications.slice(0, 5).map((app, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-accent rounded-lg">
              <div>
                <p className="font-semibold text-gray-900 dark:text-dark-primary">{app.job.title}</p>
                <p className="text-sm text-gray-600 dark:text-dark-muted">{app.job.company} • {app.job.location}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-dark-muted">{new Date(app.application.appliedAt).toLocaleDateString()}</p>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  app.application.status === 'Applied' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300' :
                  app.application.status === 'Under Review' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300' :
                  app.application.status === 'Shortlisted' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300' :
                  'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300'
                }`}>
                  {app.application.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-dark-primary mb-4">Application Activity (Last 30 Days)</h2>
        <div className="h-64 flex items-end justify-center space-x-2">
          {applicationTrends.length > 0 ? (
            applicationTrends.map((trend, index) => (
              <div key={index} className="flex flex-col items-center">
                <div 
                  className="bg-blue-500 dark:bg-blue-400 rounded-t" 
                  style={{ height: `${(trend.count / Math.max(...applicationTrends.map(t => t.count))) * 200}px`, width: '20px' }}
                ></div>
                <p className="text-xs text-gray-600 dark:text-dark-muted mt-1">{trend._id.day}/{trend._id.month}</p>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 dark:text-dark-muted">No application activity in the last 30 days</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
