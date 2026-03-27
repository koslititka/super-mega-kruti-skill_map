import apiClient from './index';
import type { Category } from '@/shared/types';

export const getMyProfile = () =>
  apiClient.get('/auth/me').then((r) => r.data);

export const updateMyProfile = (data: {
  grade?: number;
  interests?: number[];
  fullName?: string;
}) => apiClient.put('/users/me', data).then((r) => r.data);

export const getMyRegistrations = () =>
  apiClient.get('/registrations').then((r) => r.data);

export const getCategories = (): Promise<Category[]> =>
  apiClient.get('/categories').then((r) => r.data);

export const getAgeGroups = (): Promise<{ id: number; name: string }[]> =>
  apiClient.get('/categories/age-groups').then((r) => r.data);
