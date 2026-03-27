import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Recommendations } from '@/widgets/recommendations';
import { useAuth } from '@/features/auth';
import { Hero } from '../../../components/layout/Hero';
import { EventFilters, INITIAL_FILTERS } from '../../../components/events/EventFilters';
import type { EventFiltersState } from '../../../components/events/EventFilters';
import { EventGrid } from '../../../components/events/EventGrid';
import { EventCalendar } from '../../../components/events/EventCalendar';
import { useEvents } from '../../../hooks/useEvents';
import styles from './HomePage.module.css';

export const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [eventFilters, setEventFilters] = useState<EventFiltersState>(INITIAL_FILTERS);
  const { events: filteredEvents, loading: gridLoading, error: gridError } = useEvents(eventFilters);

  return (
    <>
      <Hero />
      <div className={styles.page}>
        {user && (!user.grade || !user.interests || user.interests.length === 0) && (
          <div className={styles.profileBanner}>
            <p>Укажите класс и интересы в <Link to="/profile">профиле</Link>, чтобы видеть подходящие события</p>
            <button onClick={() => navigate('/profile')} className={styles.profileBannerButton}>
              Заполнить профиль
            </button>
          </div>
        )}
        <Recommendations />
      </div>
      <div className={styles.afishaLayout}>
        <aside className={styles.filterSidebar}>
          <EventFilters filters={eventFilters} onChange={setEventFilters} />
        </aside>
        <div className={styles.eventContent}>
          <EventGrid
            events={filteredEvents}
            loading={gridLoading}
            error={gridError}
            filters={eventFilters}
            onResetFilters={() => setEventFilters(INITIAL_FILTERS)}
            interests={user?.interests?.map((c) => c.name) ?? []}
          />
          <EventCalendar
            events={filteredEvents}
            selectedDate={eventFilters.date}
            onDateSelect={(date) => setEventFilters((f) => ({ ...f, date }))}
          />
        </div>
      </div>
    </>
  );
};
