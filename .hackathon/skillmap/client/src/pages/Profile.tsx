import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLocale } from '../context/LocaleContext';
import { useToast } from '../context/ToastContext';
import { Pill } from '../components/ui/Pill';
import { updateMyProfile, getMyRegistrations, getCategories } from '../api/users';
import type { Category } from '@/shared/types';
import styles from './Profile.module.css';

const GRADE_OPTIONS = [6, 7, 8, 9, 10, 11];

interface Registration {
  id: number;
  event: {
    id: number;
    title: string;
    date: string;
  };
  status: string;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const STATUS_LABEL: Record<string, string> = {
  REGISTERED: 'Записан',
  PENDING: 'Ожидание',
  CANCELLED: 'Отменено',
};

export function Profile() {
  const { user, loading, isAuthenticated } = useAuth();
  const { t } = useLocale();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<number[]>([]);
  const [grade, setGrade] = useState<number>(9);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [saving, setSaving] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) navigate('/');
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (!user) return;
    setSelectedInterests(user.interests.map((c) => c.id));
    setGrade(user.grade ?? 9);

    getCategories().then(setCategories).catch(() => {});
    getMyRegistrations()
      .then((data) => setRegistrations(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [user]);

  const toggleInterest = (id: number) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateMyProfile({ interests: selectedInterests, grade });
      showToast(t.profile.save + ' ✓', 'success');
    } catch {
      showToast('Ошибка сохранения. Попробуйте снова.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>{t.profile.title}</h1>

        {/* Info (readonly) */}
        <section className={styles.section}>
          <div className={styles.fields}>
            <div className={styles.field}>
              <label className={styles.label}>{t.auth.name}</label>
              <input className={styles.input} value={user.fullName} readOnly tabIndex={-1} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{t.auth.email}</label>
              <input className={styles.input} value={user.email ?? '—'} readOnly tabIndex={-1} />
            </div>
          </div>
        </section>

        {/* Grade */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t.profile.grade}</h2>
          <select
            className={styles.select}
            value={grade}
            onChange={(e) => setGrade(Number(e.target.value))}
          >
            {GRADE_OPTIONS.map((g) => (
              <option key={g} value={g}>
                {g} класс
              </option>
            ))}
          </select>
        </section>

        {/* Interests */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t.profile.interests}</h2>
          <div className={styles.pills}>
            {categories.length === 0 ? (
              <p className={styles.empty}>Загрузка...</p>
            ) : (
              categories.map((cat) => (
                <Pill
                  key={cat.id}
                  label={cat.name}
                  active={selectedInterests.includes(cat.id)}
                  onClick={() => toggleInterest(cat.id)}
                />
              ))
            )}
          </div>
        </section>

        <button
          type="button"
          className={styles.saveBtn}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? '...' : t.profile.save}
        </button>

        {/* My events */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t.profile.myEvents}</h2>
          {registrations.length === 0 ? (
            <p className={styles.empty}>Нет записей на мероприятия</p>
          ) : (
            <div className={styles.eventList}>
              {registrations.map((reg) => (
                <div key={reg.id} className={styles.eventItem}>
                  <span className={styles.eventTitle}>{reg.event?.title ?? '—'}</span>
                  {reg.event?.date && (
                    <span className={styles.eventDate}>{formatDate(reg.event.date)}</span>
                  )}
                  <span className={styles.eventStatus}>
                    {STATUS_LABEL[reg.status] ?? reg.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
