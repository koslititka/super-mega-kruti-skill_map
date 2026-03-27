import { useState, useEffect } from 'react';
import { getEventParticipants } from '@/features/event-registration';
import { Button, EmptyState, Spinner } from '@/shared/ui';
import type { Participant } from '@/shared/types';
import styles from './ParticipantsTable.module.css';

interface ParticipantsTableProps {
  eventId: number;
  eventTitle: string;
}

export const ParticipantsTable = ({ eventId, eventTitle }: ParticipantsTableProps) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEventParticipants(eventId)
      .then(setParticipants)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [eventId]);

  const STATUS_LABELS: Record<string, string> = {
    PENDING: 'Ожидает',
    REGISTERED: 'Подтверждён',
  };

  const exportCsv = () => {
    const header = 'Имя,Email,Telegram,Класс,Статус,Дата регистрации\n';
    const rows = participants
      .map(
        (p) =>
          `"${p.fullName}","${p.email || ''}","${p.telegramUsername || ''}","${p.grade || ''}","${STATUS_LABELS[p.status] || p.status}","${new Date(p.registeredAt).toLocaleDateString('ru-RU')}"`
      )
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `participants-${eventTitle}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <Spinner />;

  if (participants.length === 0) {
    return <EmptyState title="Нет зарегистрированных участников" />;
  }

  return (
    <div>
      <div className={styles.header}>
        <span className={styles.count}>{participants.length} участников</span>
        <Button variant="secondary" size="sm" onClick={exportCsv}>
          Экспорт CSV
        </Button>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Имя</th>
              <th>Email</th>
              <th>Telegram</th>
              <th>Класс</th>
              <th>Статус</th>
              <th>Дата</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((p) => (
              <tr key={p.id}>
                <td>{p.fullName}</td>
                <td>{p.email || '—'}</td>
                <td>{p.telegramUsername ? `@${p.telegramUsername}` : '—'}</td>
                <td>{p.grade || '—'}</td>
                <td>{STATUS_LABELS[p.status] || p.status}</td>
                <td>{new Date(p.registeredAt).toLocaleDateString('ru-RU')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
