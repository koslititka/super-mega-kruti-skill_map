import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useLocale } from '../context/LocaleContext';
import { useToast } from '../context/ToastContext';
import { Navbar } from '../components/layout/Navbar';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../api/events';
import { getCategories, getAgeGroups } from '../api/users';
import type { Event, Category } from '@/shared/types';
import styles from './Admin.module.css';

/* ─── Constant options ─── */
const FORMATS = [
  { value: 'ONLINE', label: 'Онлайн' },
  { value: 'OFFLINE', label: 'Очно' },
];
const EVENT_TYPES = [
  { value: 'WEBINAR', label: 'Вебинар' },
  { value: 'COURSE', label: 'Курс' },
  { value: 'DOD', label: 'ДОД' },
  { value: 'PROFPROBA', label: 'Профпроба' },
];
const FORMAT_LABELS: Record<string, string> = { ONLINE: 'Онлайн', OFFLINE: 'Очно' };
const TYPE_LABELS: Record<string, string> = {
  WEBINAR: 'Вебинар', COURSE: 'Курс', DOD: 'ДОД', PROFPROBA: 'Профпроба',
};

interface FormState {
  title: string;
  description: string;
  date: string;
  time: string;
  format: string;
  eventType: string;
  registrationLink: string;
  organizerEmail: string;
  categoryIds: number[];
  ageGroupIds: number[];
}

const EMPTY_FORM: FormState = {
  title: '', description: '', date: '', time: '',
  format: 'ONLINE', eventType: 'WEBINAR',
  registrationLink: '', organizerEmail: '',
  categoryIds: [], ageGroupIds: [],
};

function eventToForm(e: Event): FormState {
  return {
    title: e.title,
    description: e.description,
    date: e.date.slice(0, 10),
    time: e.time ?? '',
    format: e.format,
    eventType: e.eventType,
    registrationLink: e.registrationLink ?? '',
    organizerEmail: e.organizerEmail,
    categoryIds: e.categories.map((c) => c.id),
    ageGroupIds: e.ageGroups.map((ag) => ag.id),
  };
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function Admin() {
  const { t } = useLocale();
  const { showToast } = useToast();

  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [ageGroups, setAgeGroups] = useState<{ id: number; name: string }[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    setLoadingEvents(true);
    try {
      const data = await getEvents({ limit: 100 });
      setEvents(data.events ?? data);
    } catch {
      showToast('Не удалось загрузить события', 'error');
    } finally {
      setLoadingEvents(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
    getCategories().then(setCategories).catch(() => {});
    getAgeGroups().then(setAgeGroups).catch(() => {});
  }, [loadEvents]);

  /* ─── Modal helpers ─── */
  const openCreate = () => {
    setEditingEvent(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setShowModal(true);
  };

  const openEdit = (event: Event) => {
    setEditingEvent(event);
    setForm(eventToForm(event));
    setFormError(null);
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  /* ─── Field change ─── */
  const set = (k: keyof FormState, v: FormState[keyof FormState]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const toggleId = (key: 'categoryIds' | 'ageGroupIds', id: number) => {
    setForm((prev) => {
      const arr = prev[key] as number[];
      return {
        ...prev,
        [key]: arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id],
      };
    });
  };

  /* ─── Submit ─── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.title.trim() || !form.description.trim() || !form.date || !form.organizerEmail) {
      setFormError('Заполните все обязательные поля');
      return;
    }
    if (form.categoryIds.length === 0) {
      setFormError('Выберите хотя бы одну категорию');
      return;
    }
    if (form.ageGroupIds.length === 0) {
      setFormError('Выберите хотя бы одну возрастную группу');
      return;
    }

    const payload = {
      title: form.title,
      description: form.description,
      date: new Date(form.date).toISOString(),
      time: form.time || null,
      format: form.format,
      eventType: form.eventType,
      registrationLink: form.registrationLink || null,
      organizerEmail: form.organizerEmail,
      categoryIds: form.categoryIds,
      ageGroupIds: form.ageGroupIds,
    };

    setSaving(true);
    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, payload);
        showToast('Событие обновлено', 'success');
      } else {
        await createEvent(payload);
        showToast('Событие создано', 'success');
      }
      closeModal();
      loadEvents();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Ошибка сохранения';
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  };

  /* ─── Delete ─── */
  const handleDelete = async (event: Event) => {
    if (!window.confirm(`Удалить «${event.title}»?`)) return;
    try {
      await deleteEvent(event.id);
      setEvents((prev) => prev.filter((e) => e.id !== event.id));
      showToast('Событие удалено', 'success');
    } catch {
      showToast('Не удалось удалить', 'error');
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>{t.admin.title}</h1>
          <button type="button" className={styles.btnAdd} onClick={openCreate}>
            {t.admin.addEvent}
          </button>
        </div>

        {/* Table */}
        <div className={styles.tableWrapper}>
          {loadingEvents ? (
            <p className={styles.loading}>Загрузка...</p>
          ) : events.length === 0 ? (
            <p className={styles.empty}>Событий нет</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Дата</th>
                  <th>Формат</th>
                  <th>Категория</th>
                  <th>Участников</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event, idx) => (
                  <tr key={event.id} className={idx % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                    <td className={styles.cellTitle}>{event.title}</td>
                    <td className={styles.cellDate}>{formatDate(event.date)}</td>
                    <td>{FORMAT_LABELS[event.format]}</td>
                    <td>{TYPE_LABELS[event.eventType]}</td>
                    <td>{event.registrationCount}</td>
                    <td>
                      <div className={styles.actions}>
                        <Link to={`/manager/${event.id}`} className={styles.btnParticipants}>
                          Участники&nbsp;
                          <span className={styles.countBadge}>{event.registrationCount}</span>
                        </Link>
                        <button
                          type="button"
                          className={styles.btnEdit}
                          onClick={() => openEdit(event)}
                        >
                          {t.admin.edit}
                        </button>
                        <button
                          type="button"
                          className={styles.btnDelete}
                          onClick={() => handleDelete(event)}
                        >
                          {t.admin.delete}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <>
          <div className={styles.overlay} onClick={closeModal} />
          <div className={styles.modal} role="dialog" aria-modal="true">
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingEvent ? 'Редактировать событие' : 'Новое событие'}
              </h2>
              <button type="button" className={styles.modalClose} onClick={closeModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form} noValidate>
              {/* Title */}
              <div className={styles.field}>
                <label className={styles.label}>Название *</label>
                <input
                  type="text"
                  className={styles.input}
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                  required
                />
              </div>

              {/* Date + Time */}
              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>Дата *</label>
                  <input
                    type="date"
                    className={styles.input}
                    value={form.date}
                    onChange={(e) => set('date', e.target.value)}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Время</label>
                  <input
                    type="time"
                    className={styles.input}
                    value={form.time}
                    onChange={(e) => set('time', e.target.value)}
                  />
                </div>
              </div>

              {/* Format + Event Type */}
              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>Формат *</label>
                  <select
                    className={styles.input}
                    value={form.format}
                    onChange={(e) => set('format', e.target.value)}
                  >
                    {FORMATS.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Категория *</label>
                  <select
                    className={styles.input}
                    value={form.eventType}
                    onChange={(e) => set('eventType', e.target.value)}
                  >
                    {EVENT_TYPES.map((et) => (
                      <option key={et.value} value={et.value}>{et.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Categories (checkboxes) */}
              <div className={styles.field}>
                <label className={styles.label}>Направления * (выберите одно или несколько)</label>
                <div className={styles.checkGroup}>
                  {categories.map((cat) => (
                    <label key={cat.id} className={styles.checkLabel}>
                      <input
                        type="checkbox"
                        checked={form.categoryIds.includes(cat.id)}
                        onChange={() => toggleId('categoryIds', cat.id)}
                      />
                      {cat.name}
                    </label>
                  ))}
                </div>
              </div>

              {/* Age groups (checkboxes) */}
              <div className={styles.field}>
                <label className={styles.label}>Возрастные группы * (выберите одну или несколько)</label>
                <div className={styles.checkGroup}>
                  {ageGroups.map((ag) => (
                    <label key={ag.id} className={styles.checkLabel}>
                      <input
                        type="checkbox"
                        checked={form.ageGroupIds.includes(ag.id)}
                        onChange={() => toggleId('ageGroupIds', ag.id)}
                      />
                      {ag.name} кл.
                    </label>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className={styles.field}>
                <label className={styles.label}>Описание *</label>
                <textarea
                  className={styles.input}
                  rows={4}
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  required
                />
              </div>

              {/* Registration link */}
              <div className={styles.field}>
                <label className={styles.label}>Ссылка на регистрацию</label>
                <input
                  type="url"
                  className={styles.input}
                  value={form.registrationLink}
                  onChange={(e) => set('registrationLink', e.target.value)}
                  placeholder="https://..."
                />
              </div>

              {/* Organizer email */}
              <div className={styles.field}>
                <label className={styles.label}>Email организатора *</label>
                <input
                  type="email"
                  className={styles.input}
                  value={form.organizerEmail}
                  onChange={(e) => set('organizerEmail', e.target.value)}
                  required
                />
              </div>

              {formError && <p className={styles.formError}>{formError}</p>}

              <div className={styles.formActions}>
                <button type="submit" className={styles.btnSave} disabled={saving}>
                  {saving ? '...' : 'Сохранить'}
                </button>
                <button type="button" className={styles.btnCancel} onClick={closeModal}>
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </>
  );
}
