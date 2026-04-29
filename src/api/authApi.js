import api from './axiosConfig';

export const register = (data) =>
  api.post('/api/v1/auth/register', data);

export const login = (data) =>
  api.post('/api/v1/auth/login', data);

export const refreshToken = (token) =>
  api.post('/api/v1/auth/refresh', null, {
    headers: { 'Refresh-Token': token },
  });

export const getUserById = (userId) =>
  api.get(`/api/v1/auth/users/${userId}`);

export const updateProfile = (userId, data) =>
  api.put(`/api/v1/auth/users/${userId}/profile`, data);

export const changePassword = (userId, data) =>
  api.put(`/api/v1/auth/users/${userId}/password`, data);

export const searchUsers = (keyword) =>
  api.get(`/api/v1/auth/users/search?keyword=${keyword}`);