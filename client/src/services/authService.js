import apiClient from './apiClient';

export const authService = {
  // Register user
  register: async (username, email, password, role) => {
    const response = await apiClient.post('/auth/register', {
      username,
      email,
      password,
      role,
    });
    return response.data;
  },

  // Login user
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  // Get current user
  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // Update profile
  updateProfile: async (data) => {
    const response = await apiClient.put('/auth/profile', data);
    return response.data;
  },
};
