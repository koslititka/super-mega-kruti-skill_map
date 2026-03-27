import apiClient from './index';
import type { Participant } from '@/shared/types';

export const getEventParticipants = (eventId: number | string): Promise<Participant[]> =>
  apiClient.get(`/registrations/event/${eventId}`).then((r) => r.data);
