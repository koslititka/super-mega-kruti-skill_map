import api from './index';
import type { Notification } from '../types';

export const getNotifications = async (): Promise<Notification[]> => {
  const { data } = await api.get<Notification[]>('/notifications');
  return data;
};

export const getUnreadCount = async (): Promise<number> => {
  const { data } = await api.get<{ count: number }>('/notifications/unread-count');
  return data.count;
};

export const markAsRead = async (id: number): Promise<void> => {
  await api.patch(`/notifications/${id}/read`);
};

export const markAllAsRead = async (): Promise<void> => {
  await api.patch('/notifications/read-all');
};
