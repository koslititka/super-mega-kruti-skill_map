import { Link } from 'react-router-dom';
import styles from './EventCard.module.css';
import { Badge } from '@/shared/ui';
import { formatDateRange } from '@/shared/lib';
import { EVENT_TYPE_LABELS, FORMAT_LABELS } from '@/shared/config';
import type { Event } from '@/shared/types';

interface EventCardProps {
  event: Event;
  actions?: React.ReactNode;
}

export const EventCard = ({ event, actions }: EventCardProps) => {
  return (
    <div className={styles.card}>
      <Link to={`/events/${event.id}`} className={styles.link}>
        <div className={styles.header}>
          <Badge variant={event.format === 'ONLINE' ? 'info' : 'warning'}>
            {FORMAT_LABELS[event.format]}
          </Badge>
          <Badge variant="primary">{EVENT_TYPE_LABELS[event.eventType]}</Badge>
        </div>
        <h3 className={styles.title}>{event.title}</h3>
        <p className={styles.date}>{formatDateRange(event.date, event.endDate)}</p>
        {event.time && <p className={styles.time}>{event.time}</p>}
        <div className={styles.tags}>
          {event.categories.map((cat) => (
            <span key={cat.id} className={styles.tag}>
              {cat.name}
            </span>
          ))}
        </div>
        <div className={styles.ageGroups}>
          {event.ageGroups.map((ag) => (
            <span key={ag.id} className={styles.ageTag}>
              {ag.name.replace('-', ' – ')} класс
            </span>
          ))}
        </div>
      </Link>
      {actions && (
        <div className={styles.actions}>
          {actions}
        </div>
      )}
    </div>
  );
};
