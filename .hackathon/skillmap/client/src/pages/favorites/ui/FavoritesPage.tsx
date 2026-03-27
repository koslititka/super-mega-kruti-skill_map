import { useState, useEffect } from 'react';
import { getFavorites, FavoriteButton } from '@/features/event-favorite';
import { EventCard } from '@/entities/event';
import { Spinner, EmptyState } from '@/shared/ui';
import type { Event } from '@/shared/types';
import styles from './FavoritesPage.module.css';

export const FavoritesPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await getFavorites();
      setEvents(data);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Избранное</h1>
      {loading ? (
        <Spinner />
      ) : events.length > 0 ? (
        <div className={styles.grid}>
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              actions={
                <FavoriteButton
                  eventId={event.id}
                  isFavorite={true}
                  onToggle={load}
                />
              }
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Нет избранных мероприятий"
          description="Добавляйте мероприятия в избранное, чтобы не потерять их"
        />
      )}
    </div>
  );
};
