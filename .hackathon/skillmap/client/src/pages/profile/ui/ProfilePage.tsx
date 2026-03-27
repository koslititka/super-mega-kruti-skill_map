import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { ProfileForm } from '@/features/profile-edit';
import { getMyRegistrations, getMyHistory } from '@/features/event-registration';
import { getFavorites } from '@/features/event-favorite';
import { EventCard } from '@/entities/event';
import { UserAvatar } from '@/entities/user';
import { Badge, EmptyState } from '@/shared/ui';
import { ROLE_LABELS } from '@/shared/config';
import type { Event, HistoryEvent } from '@/shared/types';
import styles from './ProfilePage.module.css';

export const ProfilePage = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<'profile' | 'registrations' | 'favorites' | 'history'>('profile');
  const [registrations, setRegistrations] = useState<Event[]>([]);
  const [favorites, setFavorites] = useState<Event[]>([]);
  const [history, setHistory] = useState<HistoryEvent[]>([]);

  useEffect(() => {
    if (tab === 'registrations') {
      getMyRegistrations().then(setRegistrations).catch(() => {});
    }
    if (tab === 'favorites') {
      getFavorites().then(setFavorites).catch(() => {});
    }
    if (tab === 'history') {
      getMyHistory().then(setHistory).catch(() => {});
    }
  }, [tab]);

  if (!user) return null;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <UserAvatar name={user.fullName} photoUrl={user.telegramPhotoUrl} size={64} />
        <div>
          <h1 className={styles.name}>{user.fullName}</h1>
          <Badge variant="primary">{ROLE_LABELS[user.role]}</Badge>
          {user.grade && <span className={styles.grade}>{user.grade} класс</span>}
        </div>
      </div>

      {!user.email && (
        <div className={styles.emailWarning}>
          Укажите email для получения уведомлений и подтверждения регистрации на события.
        </div>
      )}

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === 'profile' ? styles.active : ''}`}
          onClick={() => setTab('profile')}
        >
          Профиль
        </button>
        <button
          className={`${styles.tab} ${tab === 'registrations' ? styles.active : ''}`}
          onClick={() => setTab('registrations')}
        >
          Мои регистрации
        </button>
        <button
          className={`${styles.tab} ${tab === 'favorites' ? styles.active : ''}`}
          onClick={() => setTab('favorites')}
        >
          Избранное
        </button>
        <button
          className={`${styles.tab} ${tab === 'history' ? styles.active : ''}`}
          onClick={() => setTab('history')}
        >
          История
        </button>
      </div>

      <div className={styles.content}>
        {tab === 'profile' && <ProfileForm />}
        {tab === 'registrations' && (
          registrations.length > 0 ? (
            <div className={styles.grid}>
              {registrations.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          ) : (
            <EmptyState title="Нет регистраций" description="Вы ещё не зарегистрировались ни на одно мероприятие" />
          )
        )}
        {tab === 'favorites' && (
          favorites.length > 0 ? (
            <div className={styles.grid}>
              {favorites.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          ) : (
            <EmptyState title="Нет избранных" description="Добавляйте мероприятия в избранное, нажимая на сердечко" />
          )
        )}
        {tab === 'history' && (
          history.length > 0 ? (
            <div className={styles.grid}>
              {history.map((e) => (
                <EventCard
                  key={e.id}
                  event={e}
                  actions={
                    e.userRating ? (
                      <span className={styles.ratingBadge}>
                        {'★'.repeat(e.userRating)}{'☆'.repeat(5 - e.userRating)}
                      </span>
                    ) : (
                      <Link to={`/events/${e.id}`} className={styles.rateLink}>
                        Оставить отзыв
                      </Link>
                    )
                  }
                />
              ))}
            </div>
          ) : (
            <EmptyState title="История пуста" description="Здесь появятся мероприятия, которые вы посетили" />
          )
        )}
      </div>
    </div>
  );
};
