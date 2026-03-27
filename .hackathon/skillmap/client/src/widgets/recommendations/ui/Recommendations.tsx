import { useState, useEffect } from 'react';
import { EventCard } from '@/entities/event';
import { FavoriteButton } from '@/features/event-favorite';
import { useAuth } from '@/features/auth';
import api from '@/shared/api';
import type { Event } from '@/shared/types';
import styles from './Recommendations.module.css';

export const Recommendations = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (!user) return;
    api.get<Event[]>('/recommendations').then(({ data }) => setEvents(data)).catch(() => {});
  }, [user]);

  if (!user || events.length === 0) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Для вас</h2>
      <div className={styles.carousel}>
        {events.map((event) => (
          <div key={event.id} className={styles.card}>
            <EventCard
              event={event}
              actions={<FavoriteButton eventId={event.id} isFavorite={false} />}
            />
          </div>
        ))}
      </div>
    </section>
  );
};
