import api from './axiosConfig';

// Auth service admin/user APIs
export const getAllUsers = () =>
  api.get('/api/v1/auth/users');

export const searchUsers = (keyword) =>
  api.get(`/api/v1/auth/users/search?keyword=${keyword}`);

export const deactivateUser = (userId) =>
  api.put(`/api/v1/auth/users/${userId}/deactivate`);


// Execution service admin APIs
export const getExecutionStats = () =>
  api.get('/api/v1/executions/stats');

export const cancelExecutionJob = (jobId) =>
  api.post(`/api/v1/executions/${jobId}/cancel`);

export const getSupportedLanguages = () =>
  api.get('/api/v1/executions/languages');


// Notification service APIs
export const sendNotification = (data) =>
  api.post('/api/v1/notifications', data);

export const sendBulkNotification = (data) =>
  api.post('/api/v1/notifications/bulk', data);