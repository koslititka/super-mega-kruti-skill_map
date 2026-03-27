import api from '@/shared/api';
import type { AgeGroup } from '@/shared/types';

export const getAgeGroups = async () => {
  const { data } = await api.get<AgeGroup[]>('/categories');
  // Age groups don't have a separate endpoint, they come with events
  return data;
};
