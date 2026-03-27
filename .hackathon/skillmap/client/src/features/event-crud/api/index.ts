import api from '@/shared/api';
import type { Event } from '@/shared/types';

export const createEvent = async (body: any) => {
  const { data } = await api.post<Event>('/events', body);
  return data;
};

export const updateEvent = async (id: number, body: any) => {
  const { data } = await api.put<Event>(`/events/${id}`, body);
  return data;
};

export const deleteEvent = async (id: number) => {
  const { data } = await api.delete(`/events/${id}`);
  return data;
};
