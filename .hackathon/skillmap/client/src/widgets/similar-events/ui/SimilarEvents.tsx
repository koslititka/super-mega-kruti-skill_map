import { useState, useEffect } from 'react';
import { getSimilarEvents } from '@/entities/event';
import { EventCard } from '@/entities/event';
import { FavoriteButton } from '@/features/event-favorite';
import type { Event } from '@/shared/types';
import styles from './SimilarEvents.module.css';

interface SimilarEventsProps {
  eventId: number;
}

export const SimilarEvents = ({ eventId }: SimilarEventsProps) => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    getSimilarEvents(eventId).then(setEvents).catch(() => {});
  }, [eventId]);

  if (events.length === 0) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Похожие мероприятия</h2>
      <div className={styles.grid}>
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            actions={<FavoriteButton eventId={event.id} isFavorite={false} />}
          />
        ))}
      </div>
    </section>
  );
};
