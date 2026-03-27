import { EventCard } from '@/entities/event';
import { FavoriteButton } from '@/features/event-favorite';
import { EmptyState, Spinner } from '@/shared/ui';
import type { Event } from '@/shared/types';
import styles from './EventList.module.css';

interface EventListProps {
  events: Event[];
  loading?: boolean;
  favoriteIds?: number[];
}

export const EventList = ({ events, loading, favoriteIds = [] }: EventListProps) => {
  if (loading) return <Spinner />;

  if (events.length === 0) {
    return <EmptyState title="Нет мероприятий" description="Попробуйте изменить фильтры" />;
  }

  return (
    <div className={styles.grid}>
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          actions={
            <FavoriteButton
              eventId={event.id}
              isFavorite={favoriteIds.includes(event.id)}
            />
          }
        />
      ))}
    </div>
  );
};
