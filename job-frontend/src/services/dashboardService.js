import api from '../utils/api';

export const dashboardService = {
  getDashboardStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
  getJobAnalytics: async (jobId) => {
    const response = await api.get(`/dashboard/analytics/${jobId}`);
    return response.data;
  }
};
