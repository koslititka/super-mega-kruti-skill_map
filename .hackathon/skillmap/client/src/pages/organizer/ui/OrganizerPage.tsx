import { useState, useEffect } from 'react';
import { getEvents } from '@/entities/event';
import { EventForm, deleteEvent } from '@/features/event-crud';
import { ParticipantsTable } from '@/widgets/participants-table';
import { useAuth } from '@/features/auth';
import { Button, Modal, EmptyState, Spinner } from '@/shared/ui';
import { useToast } from '@/shared/ui';
import { formatDateRange } from '@/shared/lib';
import { EVENT_TYPE_LABELS } from '@/shared/config';
import type { Event } from '@/shared/types';
import styles from './OrganizerPage.module.css';

export const OrganizerPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>();
  const [viewParticipants, setViewParticipants] = useState<Event | null>(null);

  const loadEvents = async () => {
    try {
      const data = await getEvents({ limit: '100' });
      const myEvents = data.events.filter(
        (e) => e.createdBy?.id === user?.id || user?.role === 'ADMIN'
      );
      setEvents(myEvents);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить событие?')) return;
    try {
      await deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      showToast('Событие удалено', 'success');
    } catch {
      showToast('Ошибка удаления', 'error');
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setShowForm(true);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditingEvent(undefined);
    loadEvents();
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Кабинет организатора</h1>
        <Button onClick={() => { setEditingEvent(undefined); setShowForm(true); }}>
          Создать событие
        </Button>
      </div>

      {loading ? (
        <Spinner />
      ) : events.length > 0 ? (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Название</th>
                <th>Тип</th>
                <th>Дата</th>
                <th>Регистраций</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td>{event.title}</td>
                  <td>{EVENT_TYPE_LABELS[event.eventType]}</td>
                  <td>{formatDateRange(event.date, event.endDate)}</td>
                  <td>{event.registrationCount}</td>
                  <td>
                    <div className={styles.actions}>
                      <Button variant="ghost" size="sm" onClick={() => setViewParticipants(event)}>
                        Участники
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(event)}>
                        Изменить
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(event.id)}>
                        Удалить
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="Нет событий" description="Создайте первое мероприятие" />
      )}

      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingEvent(undefined); }}
        title={editingEvent ? 'Редактировать событие' : 'Новое событие'}
      >
        <EventForm event={editingEvent} onSuccess={handleSuccess} />
      </Modal>

      <Modal
        isOpen={!!viewParticipants}
        onClose={() => setViewParticipants(null)}
        title={`Участники: ${viewParticipants?.title}`}
      >
        {viewParticipants && (
          <ParticipantsTable eventId={viewParticipants.id} eventTitle={viewParticipants.title} />
        )}
      </Modal>
    </div>
  );
};
