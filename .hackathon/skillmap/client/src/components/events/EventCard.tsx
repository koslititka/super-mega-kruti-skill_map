import { Link } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import type { MockEvent } from '../../data/mockEvents';
import styles from './EventCard.module.css';

interface EventCardProps {
  event: MockEvent;
  isForYou?: boolean;
}

function formatDate(date: string, time: string): string {
  const d = new Date(date);
  const day = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  return `${day}, ${time}`;
}

const ClockIcon = () => (
  <svg className={styles.metaIcon} width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
    <path d="M6 3.5V6.5L8 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const PinIcon = () => (
  <svg className={styles.metaIcon} width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M6 1C4.34 1 3 2.34 3 4c0 2.25 3 6.5 3 6.5S9 6.25 9 4c0-1.66-1.34-3-3-3Z" stroke="currentColor" strokeWidth="1.2" />
    <circle cx="6" cy="4" r="1.1" fill="currentColor" />
  </svg>
);

function formatAgeGroup(raw: string): string {
  // "8-9 кл" → "8 – 9 класс", "10-11 кл" → "10 – 11 класс", etc.
  return raw.replace('-', ' – ').replace(/\s*кл\.?$/, ' класс');
}

export function EventCard({ event, isForYou = false }: EventCardProps) {
  const {
    title, description, date, time, format,
    category, age_group, registration_link,
  } = event;

  return (
    <article className={`${styles.card}${isForYou ? ` ${styles.cardForYou}` : ''}`}>
      <Link to={`/event/${event.id}`} className={styles.cardLink} aria-label={title} />
      <div className={styles.body}>
        {/* Top row: Badge + "Для вас" */}
        <div className={styles.topRow}>
          <Badge label={category} />
          {isForYou && (
            <span className={styles.forYouRow}>
              <span className={styles.forYouDot} aria-hidden="true" />
              <span className={styles.forYouLabel}>Для вас</span>
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className={styles.title}>{title}</h3>

        {/* Description */}
        <p className={styles.description}>{description}</p>

        {/* Meta */}
        <div className={styles.meta}>
          <div className={styles.metaRow}>
            <ClockIcon />
            <span>{formatDate(date, time)}</span>
          </div>
          <div className={styles.metaRow}>
            <PinIcon />
            <span>{format}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <span className={styles.ageGroup}>{formatAgeGroup(age_group)}</span>
        {registration_link ? (
          <a
            href={registration_link}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnGo}
          >
            Я пойду!
          </a>
        ) : (
          <span className={styles.btnDisabled}>Зарегистрироваться</span>
        )}
      </footer>
    </article>
  );
}
