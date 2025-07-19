import React, { useState, useEffect } from 'react';
import { searchService } from '../services/searchService';
import { categoryService } from '../services/categoryService';
import { FaSearch, FaFilter } from 'react-icons/fa';
import { toast } from 'react-toastify';
import JobCard from '../components/JobCard';
import JobCardSkeleton from '../components/JobCardSkeleton';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    q: '',
    category: '',
    location: '',
    jobType: '',
    workMode: '',
    company: '',
    minSalary: '',
    maxSalary: '',
    datePosted: '',
    sortBy: 'relevance'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalJobs: 0
  });
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchJobs();
    fetchCategories();
  }, []);

  const fetchJobs = async (page = 1) => {
    setLoading(true);
    try {
      const data = await searchService.searchJobs(filters, page, 10);
      setJobs(data.jobs);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    fetchJobs(1);
  };

  const handlePageChange = (page) => {
    fetchJobs(page);
  };

  const clearFilters = () => {
    setFilters({
      q: '',
      category: '',
      location: '',
      jobType: '',
      workMode: '',
      company: '',
      minSalary: '',
      maxSalary: '',
      datePosted: '',
      sortBy: 'relevance'
    });
    fetchJobs(1);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-primary mb-8">Find Jobs</h1>
      
      <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              name="q"
              value={filters.q}
              onChange={handleFilterChange}
              placeholder="Search jobs, companies, or keywords..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-primary rounded-md bg-white dark:bg-dark-accent text-gray-900 dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Search
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 dark:border-dark-primary text-gray-700 dark:text-dark-secondary rounded-md hover:bg-gray-50 dark:hover:bg-dark-accent transition-colors"
            >
              <FaFilter className="inline mr-1" /> Filters
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-6 pt-6 border-t dark:border-dark-primary">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-secondary mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-primary rounded-md bg-white dark:bg-dark-accent text-gray-900 dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-secondary mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  placeholder="City, State, or Remote"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-primary rounded-md bg-white dark:bg-dark-accent text-gray-900 dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-secondary mb-1">
                  Job Type
                </label>
                <select
                  name="jobType"
                  value={filters.jobType}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-primary rounded-md bg-white dark:bg-dark-accent text-gray-900 dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-secondary mb-1">
                  Work Mode
                </label>
                <select
                  name="workMode"
                  value={filters.workMode}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-primary rounded-md bg-white dark:bg-dark-accent text-gray-900 dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Modes</option>
                  <option value="Remote">Remote</option>
                  <option value="On-site">On-site</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-secondary mb-1">
                  Date Posted
                </label>
                <select
                  name="datePosted"
                  value={filters.datePosted}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-primary rounded-md bg-white dark:bg-dark-accent text-gray-900 dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Any time</option>
                  <option value="today">Today</option>
                  <option value="week">Past week</option>
                  <option value="month">Past month</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-secondary mb-1">
                  Sort By
                </label>
                <select
                  name="sortBy"
                  value={filters.sortBy}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-primary rounded-md bg-white dark:bg-dark-accent text-gray-900 dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="relevance">Relevance</option>
                  <option value="date">Date Posted</option>
                  <option value="salary">Salary</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={clearFilters}
                className="px-4 py-2 border border-gray-300 dark:border-dark-primary text-gray-700 dark:text-dark-secondary rounded-md hover:bg-gray-50 dark:hover:bg-dark-accent transition-colors"
              >
                Clear Filters
              </button>
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <JobCardSkeleton key={index} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.length > 0 ? (
                jobs.map(job => (
                  <JobCard key={job._id} job={job} />
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-dark-muted">No jobs found matching your criteria.</p>
                </div>
              )}
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className="px-3 py-2 border border-gray-300 dark:border-dark-primary text-gray-700 dark:text-dark-secondary rounded-md hover:bg-gray-50 dark:hover:bg-dark-accent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 border rounded-md ${
                      page === pagination.currentPage
                        ? 'bg-blue-500 dark:bg-blue-600 text-white border-blue-500 dark:border-blue-600'
                        : 'border-gray-300 dark:border-dark-primary text-gray-700 dark:text-dark-secondary hover:bg-gray-50 dark:hover:bg-dark-accent'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="px-3 py-2 border border-gray-300 dark:border-dark-primary text-gray-700 dark:text-dark-secondary rounded-md hover:bg-gray-50 dark:hover:bg-dark-accent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>

        <div className="w-full lg:w-80">
          <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-dark-primary">Search Results</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-dark-muted">
                Found {pagination.totalJobs} jobs
              </p>
              <p className="text-sm text-gray-600 dark:text-dark-muted">
                Page {pagination.currentPage} of {pagination.totalPages}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Jobs;
