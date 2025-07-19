import api from '../utils/api';

export const jobService = {
  getJobs: async (filters = {}, page = 1, limit = 10) => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    
    params.append('page', page);
    params.append('limit', limit);
    
    const response = await api.get(`/jobs?${params}`);
    return response.data;
  },

  getJobById: async (jobId) => {
    const response = await api.get(`/jobs/${jobId}`);
    return response.data;
  },

  createJob: async (jobData) => {
    const response = await api.post('/jobs', jobData);
    return response.data;
  },

  updateJob: async (jobId, jobData) => {
    const response = await api.put(`/jobs/${jobId}`, jobData);
    return response.data;
  },

  deleteJob: async (jobId) => {
    const response = await api.delete(`/jobs/${jobId}`);
    return response.data;
  },

  getUserJobs: async (page = 1, limit = 10) => {
    const response = await api.get(`/jobs/user/my-jobs?page=${page}&limit=${limit}`);
    return response.data;
  },

  applyForJob: async (jobId, applicationData) => {
    const response = await api.post(`/jobs/${jobId}/apply`, applicationData);
    return response.data;
  },

  getUserApplications: async (page = 1, limit = 10) => {
    const response = await api.get(`/jobs/user/my-applications?page=${page}&limit=${limit}`);
    return response.data;
  },

  updateApplicationStatus: async (jobId, applicationId, status) => {
    const response = await api.put(`/jobs/${jobId}/applications/${applicationId}/status`, { status });
    return response.data;
  },

  getJobApplications: async (jobId) => {
    const response = await api.get(`/jobs/${jobId}/applications`);
    return response.data;
  },

  getJobStatistics: async () => {
    const response = await api.get('/jobs/user/statistics');
    return response.data;
  }
};
