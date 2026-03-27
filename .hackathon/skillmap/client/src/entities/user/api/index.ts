import api from '@/shared/api';
import type { User } from '@/shared/types';

export const getProfile = async () => {
  const { data } = await api.get<User>('/users/me');
  return data;
};

export const updateProfile = async (body: {
  fullName?: string;
  grade?: number | null;
  age?: number | null;
  telegramUsername?: string | null;
  interests?: number[];
}) => {
  const { data } = await api.put<User>('/users/me', body);
  return data;
};
