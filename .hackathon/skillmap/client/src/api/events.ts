import apiClient from './index';

export const getEvents = (params?: Record<string, unknown>) =>
  apiClient.get('/events', { params }).then((r) => r.data);

export const getEventById = (id: number | string) =>
  apiClient.get(`/events/${id}`).then((r) => r.data);

export const getSimilarEvents = (id: number | string) =>
  apiClient.get(`/events/${id}/similar`).then((r) => r.data);

export const registerForEvent = (id: number | string) =>
  apiClient.post(`/registrations/${id}`).then((r) => r.data);

export const createEvent = (data: unknown) =>
  apiClient.post('/events', data).then((r) => r.data);

export const updateEvent = (id: number | string, data: unknown) =>
  apiClient.put(`/events/${id}`, data).then((r) => r.data);

export const deleteEvent = (id: number | string) =>
  apiClient.delete(`/events/${id}`).then((r) => r.data);
