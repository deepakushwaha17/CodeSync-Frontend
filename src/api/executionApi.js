import api from './axiosConfig';

export const submitExecution = (data) =>
  api.post('/api/v1/executions', data);

export const getJob = (jobId) =>
  api.get(`/api/v1/executions/${jobId}`);

export const getJobsByUser = (userId) =>
  api.get(`/api/v1/executions/user/${userId}`);

export const cancelJob = (jobId) =>
  api.post(`/api/v1/executions/${jobId}/cancel`);

export const getSupportedLanguages = () =>
  api.get('/api/v1/executions/languages');

export const getStats = () =>
  api.get('/api/v1/executions/stats');