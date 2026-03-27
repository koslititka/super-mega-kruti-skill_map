import api from './index';
import type { EventRatingsResponse, EventRating } from '../types';

export const getEventRatings = async (eventId: number): Promise<EventRatingsResponse> => {
  const { data } = await api.get<EventRatingsResponse>(`/ratings/${eventId}`);
  return data;
};

export const getMyRating = async (eventId: number): Promise<EventRating | null> => {
  try {
    const { data } = await api.get<EventRating>(`/ratings/${eventId}/my`);
    return data;
  } catch {
    return null;
  }
};

export const rateEvent = async (eventId: number, rating: number, comment?: string): Promise<void> => {
  await api.post(`/ratings/${eventId}`, { rating, comment });
};
