import api from './axiosConfig';

export const createSession = (data) =>
  api.post('/api/v1/sessions', data);

export const getSession = (sessionId) =>
  api.get(`/api/v1/sessions/${sessionId}`);

export const getSessionsByProject = (projectId) =>
  api.get(`/api/v1/sessions/project/${projectId}`);

export const getActiveSession = (projectId, fileId) =>
  api.get(
    `/api/v1/sessions/active`
    + `?projectId=${projectId}&fileId=${fileId}`
  );

export const joinSession = (sessionId, data) =>
  api.post(`/api/v1/sessions/${sessionId}/join`, data);

export const leaveSession = (sessionId) =>
  api.post(`/api/v1/sessions/${sessionId}/leave`);

export const endSession = (sessionId) =>
  api.post(`/api/v1/sessions/${sessionId}/end`);

export const kickParticipant = (sessionId, userId) =>
  api.post(
    `/api/v1/sessions/${sessionId}/kick/${userId}`
  );

export const getParticipants = (sessionId) =>
  api.get(
    `/api/v1/sessions/${sessionId}/participants`
  );