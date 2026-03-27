import api from '@/shared/api';
import type { Category } from '@/shared/types';

export const getCategories = async () => {
  const { data } = await api.get<Category[]>('/categories');
  return data;
};
