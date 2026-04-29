import api from './axiosConfig';

export const createFile = (data) =>
  api.post('/api/v1/files', data);

export const createFolder = (data) =>
  api.post('/api/v1/files/folder', data);

export const getFileById = (id) =>
  api.get(`/api/v1/files/${id}`);

export const getFilesByProject = (projectId) =>
  api.get(`/api/v1/files/project/${projectId}`);

export const getFileContent = (id) =>
  api.get(`/api/v1/files/${id}/content`);

export const getFileTree = (projectId) =>
  api.get(`/api/v1/files/project/${projectId}/tree`);

export const updateFileContent = (id, content) =>
  api.put(`/api/v1/files/${id}/content`, { content });

export const renameFile = (id, newName) =>
  api.put(`/api/v1/files/${id}/rename`, { newName });

export const moveFile = (id, newParentPath) =>
  api.put(`/api/v1/files/${id}/move`, { newParentPath });

export const deleteFile = (id) =>
  api.delete(`/api/v1/files/${id}`);

export const restoreFile = (id) =>
  api.post(`/api/v1/files/${id}/restore`);

export const searchInProject = (projectId, keyword) =>
  api.get(
    `/api/v1/files/project/${projectId}/search`
    + `?keyword=${keyword}`
  );