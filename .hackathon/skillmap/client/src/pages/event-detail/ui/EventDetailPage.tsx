import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getEventById, recordView } from '@/entities/event';
import { RegisterButton, getMyRegistrations } from '@/features/event-registration';
import { FavoriteButton, getFavorites } from '@/features/event-favorite';
import { SimilarEvents } from '@/widgets/similar-events';
import { useAuth } from '@/features/auth';
import { Badge, Spinner } from '@/shared/ui';
import { formatDateRange, buildGoogleCalendarUrl } from '@/shared/lib';
import { EVENT_TYPE_LABELS, FORMAT_LABELS } from '@/shared/config';
import { getEventRatings, getMyRating, rateEvent } from '@/shared/api/ratings';
import type { Event, EventRatingsResponse, EventRating } from '@/shared/types';
import styles from './EventDetailPage.module.css';

export const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registrationStatus, setRegistrationStatus] = useState<'PENDING' | 'REGISTERED' | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [ratingsData, setRatingsData] = useState<EventRatingsResponse | null>(null);
  const [myRating, setMyRating] = useState<EventRating | null>(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        const data = await getEventById(id);
        setEvent(data);
        recordView(id).catch(() => {});

        if (user) {
          const [regs, favs] = await Promise.all([
            getMyRegistrations().catch(() => []),
            getFavorites().catch(() => []),
          ]);
          const reg = regs.find((r: any) => r.id === data.id);
          setRegistrationStatus(reg ? (reg as any).registrationStatus : null);
          setIsFavorite(favs.some((f: any) => f.id === data.id));
        }

        const ratings = await getEventRatings(Number(id)).catch(() => null);
        setRatingsData(ratings);

        if (user) {
          const my = await getMyRating(Number(id));
          setMyRating(my);
          if (my) setRatingValue(my.rating);
        }
      } catch {
        // error
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, user]);

  const isEventEnded = (event: Event) => {
    const end = event.endDate || event.date;
    return new Date(end) < new Date();
  };

  const handleSubmitRating = async () => {
    if (!id || ratingValue === 0) return;
    try {
      setSubmittingRating(true);
      await rateEvent(Number(id), ratingValue, ratingComment || undefined);
      const my = await getMyRating(Number(id));
      setMyRating(my);
      const ratings = await getEventRatings(Number(id));
      setRatingsData(ratings);
    } catch (err: any) {
      console.error(err);
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading) return <Spinner />;
  if (!event) return <div className={styles.error}>Событие не найдено</div>;

  const ended = isEventEnded(event);
  const canRate = ended && registrationStatus === 'REGISTERED';

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.badges}>
          <Badge variant={event.format === 'ONLINE' ? 'info' : 'warning'}>
            {FORMAT_LABELS[event.format]}
          </Badge>
          <Badge variant="primary">{EVENT_TYPE_LABELS[event.eventType]}</Badge>
        </div>

        <h1 className={styles.title}>{event.title}</h1>

        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <strong>Дата:</strong> {formatDateRange(event.date, event.endDate)}
          </div>
          {event.time && (
            <div className={styles.metaItem}>
              <strong>Время:</strong> {event.time}
            </div>
          )}
          <div className={styles.metaItem}>
            <strong>Организатор:</strong> {event.organizerEmail}
          </div>
          <div className={styles.metaItem}>
            <strong>Зарегистрировано:</strong> {event.registrationCount} чел.
          </div>
          {ratingsData && ratingsData.totalRatings > 0 && (
            <div className={styles.metaItem}>
              <strong>Рейтинг:</strong> ★ {ratingsData.averageRating} ({ratingsData.totalRatings} оценок)
            </div>
          )}
        </div>

        <div className={styles.tags}>
          {event.categories.map((cat) => (
            <Badge key={cat.id}>{cat.name}</Badge>
          ))}
        </div>

        <div className={styles.ageGroups}>
          {event.ageGroups.map((ag) => (
            <Badge key={ag.id} variant="success">
              {ag.name} кл.
            </Badge>
          ))}
        </div>

        <div className={styles.description}>{event.description}</div>

        <div className={styles.actions}>
          {!ended ? (
            <RegisterButton
              eventId={event.id}
              registrationStatus={registrationStatus}
              registrationLink={event.registrationLink}
            />
          ) : (
            event.registrationLink && (
              <a
                href={event.registrationLink}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.regLink}
              >
                Записаться →
              </a>
            )
          )}
          <FavoriteButton eventId={event.id} isFavorite={isFavorite} />
          {registrationStatus === 'REGISTERED' && (
            <a
              href={buildGoogleCalendarUrl(event)}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.calendarButton}
            >
              📅 Добавить в Google Calendar
            </a>
          )}
        </div>

        {canRate && (
          <div id="rating" className={styles.ratingBlock}>
            <h2 className={styles.ratingTitle}>Оцените мероприятие</h2>
            {myRating ? (
              <div className={styles.myRating}>
                <p>Ваша оценка: {'★'.repeat(myRating.rating)}{'☆'.repeat(5 - myRating.rating)}</p>
                {myRating.comment && <p>{myRating.comment}</p>}
              </div>
            ) : (
              <div className={styles.ratingForm}>
                <div className={styles.stars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className={`${styles.star} ${ratingValue >= star ? styles.starActive : ''}`}
                      onClick={() => setRatingValue(star)}
                      type="button"
                    >
                      ★
                    </button>
                  ))}
                </div>
                <textarea
                  className={styles.commentInput}
                  placeholder="Комментарий (необязательно)"
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  rows={3}
                />
                <button
                  className={styles.submitRating}
                  onClick={handleSubmitRating}
                  disabled={ratingValue === 0 || submittingRating}
                  type="button"
                >
                  {submittingRating ? 'Отправка...' : 'Отправить оценку'}
                </button>
              </div>
            )}
          </div>
        )}

        {ratingsData && ratingsData.ratings.length > 0 && (
          <div className={styles.reviews}>
            <h2 className={styles.ratingTitle}>Отзывы</h2>
            {ratingsData.ratings.map((r) => (
              <div key={r.id} className={styles.review}>
                <div className={styles.reviewHeader}>
                  <span className={styles.reviewUser}>{r.user.fullName}</span>
                  <span className={styles.reviewStars}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                </div>
                {r.comment && <p className={styles.reviewComment}>{r.comment}</p>}
              </div>
            ))}
          </div>
        )}

        <SimilarEvents eventId={event.id} />
      </div>
    </div>
  );
};
