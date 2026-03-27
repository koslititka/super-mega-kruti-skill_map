import api from '@/shared/api';
import type { Event } from '@/shared/types';

export const getFavorites = async () => {
  const { data } = await api.get<Event[]>('/favorites');
  return data;
};

export const addFavorite = async (eventId: number) => {
  const { data } = await api.post(`/favorites/${eventId}`);
  return data;
};

export const removeFavorite = async (eventId: number) => {
  const { data } = await api.delete(`/favorites/${eventId}`);
  return data;
};
