import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEventById, registerForEvent } from '../api/events';
import { getMyRegistrations } from '../api/users';
import { useAuth } from '../hooks/useAuth';
import { useLocale } from '../context/LocaleContext';
import { useToast } from '../context/ToastContext';
import { AuthModal } from '../components/auth/AuthModal';
import { Badge } from '../components/ui/Badge';
import { Navbar } from '../components/layout/Navbar';
import type { Event } from '@/shared/types';
import styles from './EventDetail.module.css';

const FORMAT_LABEL: Record<string, string> = {
  ONLINE: 'Онлайн',
  OFFLINE: 'Очно',
};

const EVENT_TYPE_LABEL: Record<string, string> = {
  WEBINAR: 'Вебинар',
  COURSE: 'Курс',
  PROFPROBA: 'Профпроба',
  DOD: 'ДОД',
};

function formatEventDate(dateStr: string, endDateStr?: string | null): string {
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  const start = new Date(dateStr).toLocaleDateString('ru-RU', opts);
  if (!endDateStr) return start;
  const end = new Date(endDateStr).toLocaleDateString('ru-RU', opts);
  return `${start} — ${end}`;
}

export function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLocale();
  const { showToast } = useToast();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    const load = async () => {
      try {
        const data = await getEventById(id);
        setEvent(data);

        if (user) {
          const regs = await getMyRegistrations().catch(() => []);
          setIsRegistered(
            (regs as Array<{ id?: number; event?: { id: number }; status?: string }>).some(
              (r) => (r.event?.id ?? r.id) === data.id && r.status !== 'CANCELLED'
            )
          );
        }
      } catch {
        // silently fail – shown in UI
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, user]);

  const handleRegister = async () => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }
    if (!event || isRegistered || registering) return;
    setRegistering(true);
    try {
      await registerForEvent(event.id);
      setIsRegistered(true);
      showToast(t.eventDetail.registrationSuccess, 'success');
    } catch {
      showToast(t.eventDetail.registrationError, 'error');
    } finally {
      setRegistering(false);
    }
  };

  const registerBtn = (className: string) => {
    if (isRegistered) {
      return (
        <button type="button" className={`${className} ${styles.btnRegistered}`} disabled>
          {t.eventDetail.registered}
        </button>
      );
    }
    return (
      <button
        type="button"
        className={`${className} ${styles.btnGo}`}
        onClick={handleRegister}
        disabled={registering}
      >
        {registering ? '...' : (isAuthenticated ? t.eventDetail.goButton : t.eventDetail.loginToRegister)}
      </button>
    );
  };

  // --- Skeleton ---
  if (loading) {
    return (
      <>
        <Navbar />
        <div className={styles.page}>
          <div className={styles.skeleton}>
            <div className={styles.skeletonBreadcrumb} />
            <div className={styles.skeletonTitle} />
            <div className={styles.skeletonMeta} />
            <div className={styles.skeletonBody} />
          </div>
        </div>
      </>
    );
  }

  if (!event) {
    return (
      <>
        <Navbar />
        <div className={styles.page}>
          <p className={styles.notFound}>{t.eventDetail.notFound}</p>
        </div>
      </>
    );
  }

  const dateLabel = formatEventDate(event.date, event.endDate);
  const timeLabel = event.time ?? null;
  const formatLabel = FORMAT_LABEL[event.format] ?? event.format;
  const typeLabel = EVENT_TYPE_LABEL[event.eventType] ?? event.eventType;
  const organizer = event.createdBy?.fullName ?? null;
  const ageLabel = event.ageGroups.map((ag) => `${ag.name} кл.`).join(', ');

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        {/* Breadcrumbs */}
        <nav className={styles.breadcrumb} aria-label="breadcrumb">
          <Link to="/" className={styles.breadcrumbLink}>{t.eventDetail.breadcrumb}</Link>
          <span className={styles.breadcrumbSep} aria-hidden="true">›</span>
          <span className={styles.breadcrumbCurrent}>{event.title}</span>
        </nav>

        <div className={styles.layout}>
          {/* Main content */}
          <article className={styles.main}>
            {/* Meta row */}
            <div className={styles.metaRow}>
              <Badge label={typeLabel} />
              <span className={styles.metaChip}>{formatLabel}</span>
              <span className={styles.metaChip}>{dateLabel}</span>
              {ageLabel && <span className={styles.metaChip}>{ageLabel}</span>}
            </div>

            <h1 className={styles.title}>{event.title}</h1>

            <p className={styles.description}>{event.description}</p>

            {event.categories.length > 0 && (
              <div className={styles.tagRow}>
                {event.categories.map((cat) => (
                  <Badge key={cat.id} label={cat.name} />
                ))}
              </div>
            )}
          </article>

          {/* Sidebar — desktop only (mobile is sticky-footer) */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarCard}>
              <div className={styles.sidebarDate}>
                <span className={styles.sidebarDateMain}>{dateLabel}</span>
                {timeLabel && <span className={styles.sidebarTime}>{timeLabel}</span>}
              </div>

              <div className={styles.sidebarRow}>
                <span className={styles.sidebarLabel}>{t.eventDetail.format}</span>
                <span>{formatLabel}</span>
              </div>

              {organizer && (
                <div className={styles.sidebarRow}>
                  <span className={styles.sidebarLabel}>{t.eventDetail.organizer}</span>
                  <span>{organizer}</span>
                </div>
              )}

              <div className={styles.sidebarRow}>
                <span className={styles.sidebarLabel}>Email</span>
                <a href={`mailto:${event.organizerEmail}`} className={styles.sidebarEmail}>
                  {event.organizerEmail}
                </a>
              </div>

              {registerBtn(styles.btnSidebar)}

              {event.registrationLink && (
                <a
                  href={event.registrationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.externalLink}
                >
                  {t.eventDetail.externalReg}
                </a>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile sticky footer */}
      <div className={styles.mobileFooter}>
        <span className={styles.mobileFooterTitle}>{event.title}</span>
        {registerBtn(styles.btnMobile)}
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
