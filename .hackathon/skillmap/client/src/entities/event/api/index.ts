import api from '@/shared/api';
import type { Event, PaginatedResponse } from '@/shared/types';

export const getEvents = async (params?: Record<string, string>) => {
  const { data } = await api.get<PaginatedResponse<Event>>('/events', { params });
  return data;
};

export const getEventById = async (id: number | string) => {
  const { data } = await api.get<Event>(`/events/${id}`);
  return data;
};

export const getSimilarEvents = async (id: number | string) => {
  const { data } = await api.get<Event[]>(`/events/${id}/similar`);
  return data;
};

export const recordView = async (id: number | string) => {
  await api.post(`/events/${id}/view`);
};
