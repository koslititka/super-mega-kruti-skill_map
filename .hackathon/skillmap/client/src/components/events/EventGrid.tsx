import { useMemo } from 'react';
import { EventCard } from './EventCard';
import { useLocale } from '../../context/LocaleContext';
import type { MockEvent } from '../../data/mockEvents';
import type { EventFiltersState } from './EventFilters';
import styles from './EventGrid.module.css';

interface EventGridProps {
  events: MockEvent[];
  loading: boolean;
  error?: string | null;
  filters: EventFiltersState;
  onResetFilters: () => void;
  interests?: string[];
}

export function EventGrid({
  events,
  loading,
  error,
  filters,
  onResetFilters,
  interests = [],
}: EventGridProps) {
  const { t } = useLocale();

  const sorted = useMemo(
    () =>
      [...events].sort((a, b) => {
        const aForYou = interests.includes(a.direction);
        const bForYou = interests.includes(b.direction);
        if (aForYou !== bForYou) return aForYou ? -1 : 1;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }),
    [events, interests]
  );

  const hasActiveFilters = Boolean(
    filters.direction || filters.format || filters.ageGroup || filters.category || filters.date
  );

  const subtitle = loading
    ? 'Загрузка...'
    : error
    ? 'Не удалось загрузить события'
    : filters.date
    ? `${sorted.length > 0 ? sorted.length + ' событий' : 'Нет событий'} ${filters.date}`
    : hasActiveFilters
    ? `Найдено: ${sorted.length}`
    : t.events.sectionTitle;

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <p className={styles.sectionTitle}>{subtitle}</p>

        <div className={styles.grid}>
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={styles.skeleton} aria-hidden="true" />
            ))
          ) : sorted.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon} aria-hidden="true">🔍</span>
              <p className={styles.emptyText}>{error ?? t.events.empty}</p>
              {hasActiveFilters && !error && (
                <button type="button" className={styles.emptyReset} onClick={onResetFilters}>
                  {t.events.resetFilters}
                </button>
              )}
            </div>
          ) : (
            sorted.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isForYou={interests.includes(event.direction)}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
