import api from './axiosConfig';

export const addComment = (data) =>
  api.post('/api/v1/comments', data);

export const getCommentById = (id) =>
  api.get(`/api/v1/comments/${id}`);

export const getCommentsByFile = (fileId) =>
  api.get(`/api/v1/comments/file/${fileId}`);

export const getCommentsByProject = (projectId) =>
  api.get(`/api/v1/comments/project/${projectId}`);

export const getReplies = (commentId) =>
  api.get(`/api/v1/comments/${commentId}/replies`);

export const getCommentsByLine = (fileId, line) =>
  api.get(
    `/api/v1/comments/file/${fileId}/line/${line}`
  );

export const updateComment = (id, content) =>
  api.put(`/api/v1/comments/${id}`, { content });

export const deleteComment = (id) =>
  api.delete(`/api/v1/comments/${id}`);

export const resolveComment = (id) =>
  api.put(`/api/v1/comments/${id}/resolve`);

export const unresolveComment = (id) =>
  api.put(`/api/v1/comments/${id}/unresolve`);

export const getCommentCount = (fileId) =>
  api.get(`/api/v1/comments/file/${fileId}/count`);