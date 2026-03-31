import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const updateProfile = async (profileData) => {
  const response = await api.put('/auth/users/profile', profileData);
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/users/me');
  return response.data;
};

export const getRoomArchives = async () => {
  const response = await api.get('/auth/users/room-archives');
  return response.data;
};

export const getUsers = async () => {
  const response = await api.get('/auth/users');
  return response.data;
};

export const uploadAvatar = async (avatarFile) => {
  const formData = new FormData();
  formData.append('avatar', avatarFile);
  const response = await api.post('/auth/users/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteAccount = async (password) => {
  const response = await api.delete('/auth/users/delete-account', {
    data: { password }
  });
  return response.data;
};

export default api;
