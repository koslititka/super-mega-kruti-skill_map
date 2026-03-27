import { useState, useEffect, useCallback } from 'react';
import { getEvents } from '../api/events';
import type { EventFiltersState } from '../components/events/EventFilters';
import type { MockEvent } from '../data/mockEvents';
import type { Event } from '@/shared/types';

/* ── Mapping helpers ── */
const FORMAT_API: Record<string, string> = {
  Онлайн: 'ONLINE',
  Очно: 'OFFLINE',
};

const CATEGORY_TO_EVENT_TYPE: Record<string, string> = {
  Вебинар: 'WEBINAR',
  МК: 'WEBINAR',
  Курс: 'COURSE',
  ДОД: 'DOD',
  Профпроба: 'PROFPROBA',
};

const EVENT_TYPE_LABEL: Record<string, MockEvent['category']> = {
  WEBINAR: 'Вебинар',
  COURSE: 'Курс',
  PROFPROBA: 'Профпроба',
  DOD: 'ДОД',
};

function normalizeEvent(e: Event): MockEvent {
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    date: e.date,
    time: e.time ?? '00:00',
    format: e.format === 'ONLINE' ? 'Онлайн' : 'Очно',
    direction: e.categories[0]?.name ?? '',
    category: EVENT_TYPE_LABEL[e.eventType] ?? 'Вебинар',
    age_group: (e.ageGroups[0]?.name ?? '8-9 кл') as MockEvent['age_group'],
    organizer: e.createdBy?.fullName ?? '',
    organizer_email: e.organizerEmail,
    registration_link: e.registrationLink,
  };
}

export function useEvents(filters?: EventFiltersState) {
  const [events, setEvents] = useState<MockEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const params: Record<string, unknown> = { limit: 50 };
    if (filters?.format) params.format = FORMAT_API[filters.format];
    if (filters?.category) {
      const et = CATEGORY_TO_EVENT_TYPE[filters.category];
      if (et) params.eventType = et;
    }

    getEvents(params)
      .then((data) => {
        let raw: Event[] = data.events ?? data;

        // Filter on raw Event[] to correctly handle multi-category/multi-ageGroup events
        if (filters?.direction) {
          raw = raw.filter((e) => e.categories.some((c) => c.name === filters.direction));
        }
        if (filters?.ageGroup) {
          const ageSearch = filters.ageGroup.replace(' кл', '').trim();
          raw = raw.filter((e) => e.ageGroups.some((ag) => ag.name === ageSearch));
        }
        if (filters?.date) {
          raw = raw.filter((e) => e.date.startsWith(filters.date!));
        }

        setEvents(raw.map(normalizeEvent));
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Ошибка загрузки';
        setError(msg);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.format, filters?.category, filters?.direction, filters?.ageGroup, filters?.date, trigger]);

  const refetch = useCallback(() => setTrigger((t) => t + 1), []);

  return { events, loading, error, refetch };
}
