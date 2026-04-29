import api from './axiosConfig';

export const getNotifications = (recipientId) =>
  api.get(
    `/api/v1/notifications/recipient/${recipientId}`
  );

export const getUnread = (recipientId) =>
  api.get(
    `/api/v1/notifications/recipient/${recipientId}/unread`
  );

export const getUnreadCount = (recipientId) =>
  api.get(
    `/api/v1/notifications/recipient/${recipientId}/count`
  );

export const markAsRead = (id) =>
  api.put(`/api/v1/notifications/${id}/read`);

export const markAllAsRead = (recipientId) =>
  api.put(
    `/api/v1/notifications/recipient/${recipientId}/read-all`
  );

export const deleteNotification = (id) =>
  api.delete(`/api/v1/notifications/${id}`);

export const deleteAllRead = (recipientId) =>
  api.delete(
    `/api/v1/notifications/recipient/${recipientId}/read`
  );