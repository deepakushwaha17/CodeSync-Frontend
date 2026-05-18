import api from './axiosConfig';

export const createSnapshot = (data) =>
  api.post('/api/v1/versions/snapshots', data);

export const getSnapshotById = (id) =>
  api.get(`/api/v1/versions/snapshots/${id}`);

export const getSnapshotsByFile = (fileId) =>
  api.get(`/api/v1/versions/snapshots/file/${fileId}`);

export const getLatestSnapshot = (fileId) =>
  api.get(
    `/api/v1/versions/snapshots/file/${fileId}/latest`
  );

export const getFileHistory = (fileId) =>
  api.get(
    `/api/v1/versions/snapshots/file/${fileId}/history`
  );

export const restoreSnapshot = (snapshotId) =>
  api.post(
    `/api/v1/versions/snapshots/${snapshotId}/restore`
  );

export const diffSnapshots = (a, b) =>
  api.get(
    `/api/v1/versions/snapshots/diff?a=${a}&b=${b}`
  );

export const getBranches = (projectId) =>
  api.get(
    `/api/v1/versions/branches/project/${projectId}`
  );

export const tagSnapshot = (id, tag) =>
  api.put(`/api/v1/versions/snapshots/${id}/tag`, { tag });

export const createBranch = (data) =>
  api.post('/api/v1/versions/branches', data);