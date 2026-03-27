import api from '@/shared/api';
import type { Stats } from '@/shared/types';

export const getAllUsers = async () => {
  const { data } = await api.get('/admin/users');
  return data;
};

export const updateUserRole = async (userId: number, role: string) => {
  const { data } = await api.put(`/admin/users/${userId}/role`, { role });
  return data;
};

export const getStats = async () => {
  const { data } = await api.get<Stats>('/admin/stats');
  return data;
};
