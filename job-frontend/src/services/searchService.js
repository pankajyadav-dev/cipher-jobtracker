import api from '../utils/api';

export const searchService = {
  searchJobs: async (searchParams, page = 1, limit = 10) => {
    const params = new URLSearchParams();

    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    params.append('page', page);
    params.append('limit', limit);

    const response = await api.get(`/search/jobs?${params}`);
    return response.data;
  },

  getSearchSuggestions: async (query, type = 'all') => {
    const response = await api.get(`/search/suggestions?q=${query}&type=${type}`);
    return response.data.suggestions;
  },

  getSearchFilters: async () => {
    const response = await api.get('/search/filters');
    return response.data;
  },

  saveSearch: async (searchData) => {
    const response = await api.post('/search/save', searchData);
    return response.data;
  }
};

