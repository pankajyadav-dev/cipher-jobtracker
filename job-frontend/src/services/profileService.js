import api from '../utils/api';

export const profileService = {
  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/profile', profileData);
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await api.put('/profile/change-password', passwordData);
    return response.data;
  },

  deleteAccount: async (password) => {
    const response = await api.delete('/profile', { data: { password } });
    return response.data;
  },

  uploadProfilePicture: async (profilePicture) => {
    const response = await api.put('/profile/profile-picture', { profilePicture });
    return response.data;
  },

  uploadResume: async (resumeFile) => {
    const formData = new FormData();
    formData.append('resume', resumeFile);
    const response = await api.post('/profile/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteResume: async () => {
    const response = await api.delete('/profile/resume');
    return response.data;
  },

  getPublicProfile: async (userId) => {
    const response = await api.get(`/profile/public/${userId}`);
    return response.data;
  }
};
