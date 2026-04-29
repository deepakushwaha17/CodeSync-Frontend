import api from './axiosConfig';

export const createProject  = (data) =>
  api.post('/api/v1/projects', data);

export const getProjectById = (id) =>
  api.get(`/api/v1/projects/${id}`);

export const getPublicProjects = () =>
  api.get('/api/v1/projects/public');

export const getMyProjects = (ownerId) =>
  api.get(`/api/v1/projects/owner/${ownerId}`);

export const getMemberProjects = () =>
  api.get('/api/v1/projects/member');

export const searchProjects = (keyword) =>
  api.get(`/api/v1/projects/search?keyword=${keyword}`);

export const updateProject = (id, data) =>
  api.put(`/api/v1/projects/${id}`, data);

export const archiveProject = (id) =>
  api.put(`/api/v1/projects/${id}/archive`);

export const deleteProject = (id) =>
  api.delete(`/api/v1/projects/${id}`);

export const forkProject = (id) =>
  api.post(`/api/v1/projects/${id}/fork`);

export const starProject = (id) =>
  api.post(`/api/v1/projects/${id}/star`);

export const unstarProject = (id) =>
  api.delete(`/api/v1/projects/${id}/star`);

export const getMembers = (id) =>
  api.get(`/api/v1/projects/${id}/members`);

export const addMember = (id, data) =>
  api.post(`/api/v1/projects/${id}/members`, data);

export const removeMember = (projectId, userId) =>
  api.delete(
    `/api/v1/projects/${projectId}/members/${userId}`
  );