import api from '../utils/api';

export const categoryService = {
  getCategories: async (active = true, popular = false) => {
    const params = new URLSearchParams();
    if (active) params.append('active', 'true');
    if (popular) params.append('popular', 'true');
    
    const response = await api.get(`/categories?${params}`);
    return response.data;
  },
  getCategoryById: async (categoryId) => {
    const response = await api.get(`/categories/${categoryId}`);
    return response.data;
  },
  createCategory: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },
  updateCategory: async (categoryId, categoryData) => {
    const response = await api.put(`/categories/${categoryId}`, categoryData);
    return response.data;
  },
  deleteCategory: async (categoryId) => {
    const response = await api.delete(`/categories/${categoryId}`);
    return response.data;
  },
  updateCategoryJobCount: async (categoryId) => {
    const response = await api.put(`/categories/${categoryId}/update-count`);
    return response.data;
  }
};
