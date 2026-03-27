import api from '@/shared/api';
import type { Event, HistoryEvent, Participant } from '@/shared/types';

export const registerForEvent = async (eventId: number) => {
  const { data } = await api.post(`/registrations/${eventId}`);
  return data;
};

export const cancelRegistration = async (eventId: number) => {
  const { data } = await api.delete(`/registrations/${eventId}`);
  return data;
};

export const getMyRegistrations = async () => {
  const { data } = await api.get<Event[]>('/registrations');
  return data;
};

export const getEventParticipants = async (eventId: number) => {
  const { data } = await api.get<Participant[]>(`/registrations/event/${eventId}`);
  return data;
};

export const getMyHistory = async () => {
  const { data } = await api.get<HistoryEvent[]>('/registrations/history');
  return data;
};
