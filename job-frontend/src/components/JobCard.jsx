import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaBriefcase, FaClock, FaBuilding, FaEye } from 'react-icons/fa';

const JobCard = ({ job }) => {
  return (
    <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-md p-6 hover:shadow-lg dark:hover:shadow-2xl transition-shadow card-hover">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <Link to={`/jobs/${job._id}`} className="text-xl font-bold text-gray-900 dark:text-dark-primary hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {job.title}
          </Link>
          <div className="flex items-center space-x-4 text-gray-600 dark:text-dark-muted mt-2">
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
          <span className={`px-3 py-1 rounded-full text-sm ${
            job.featured 
              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}>
            {job.featured ? 'Featured' : 'Regular'}
          </span>
        </div>
      </div>
      
      <p className="text-gray-700 dark:text-dark-secondary mb-4 line-clamp-2">
        {job.description}
      </p>
      
        {job.skills && job.skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {job.skills.slice(0, 5).map((skill, index) => (
            <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs rounded">
              {skill}
            </span>
          ))}
          {job.skills.length > 5 && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded">
              +{job.skills.length - 5} more
            </span>
          )}
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500 dark:text-dark-muted">
            Posted {new Date(job.createdAt).toLocaleDateString()}
          </div>
          <div className="flex items-center text-sm text-gray-500 dark:text-dark-muted">
            <FaEye className="mr-1" />
            {job.viewCount || 0} views
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {job.salary && job.salary.min && (
            <span className="text-green-600 dark:text-green-400 font-semibold">
              {job.salary.min.toLocaleString()}
              {job.salary.max && ` - ${job.salary.max.toLocaleString()}`}
              {job.salary.currency && ` ${job.salary.currency}`}
            </span>
          )}
          <Link
            to={`/jobs/${job._id}`}
            className="bg-blue-500 dark:bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-600 dark:hover:bg-blue-800 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
