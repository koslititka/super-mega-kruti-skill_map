import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { useToast } from '../context/ToastContext';
import { getEventById } from '../api/events';
import { getEventParticipants } from '../api/registrations';
import type { Event, Participant } from '@/shared/types';
import styles from './ManagerPanel.module.css';

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function exportCSV(participants: Participant[], eventTitle: string) {
  const rows = [
    ['#', 'Имя', 'Email', 'Telegram', 'Дата регистрации'],
    ...participants.map((p, i) => [
      String(i + 1),
      p.fullName,
      p.email ?? '',
      p.telegramUsername ? `@${p.telegramUsername}` : '',
      formatDate(p.registeredAt),
    ]),
  ];
  const csv = rows.map((r) => r.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `participants_${eventTitle.replace(/\s+/g, '_').slice(0, 40)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function ManagerPanel() {
  const { eventId } = useParams<{ eventId: string }>();
  const { showToast } = useToast();

  const [event, setEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    setLoading(true);

    Promise.all([
      getEventById(eventId),
      getEventParticipants(eventId),
    ])
      .then(([ev, parts]) => {
        setEvent(ev);
        setParticipants(Array.isArray(parts) ? parts : []);
      })
      .catch(() => showToast('Не удалось загрузить данные', 'error'))
      .finally(() => setLoading(false));
  }, [eventId]);

  const handleCopyEmails = () => {
    const emails = participants.map((p) => p.email).filter(Boolean).join(', ');
    navigator.clipboard.writeText(emails).then(() => {
      showToast('Email скопированы', 'success');
    }).catch(() => {
      showToast('Не удалось скопировать', 'error');
    });
  };

  const handleExportCSV = () => {
    if (!event) return;
    exportCSV(participants, event.title);
    showToast('CSV скачан', 'success');
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className={styles.page}>
          <p className={styles.loading}>Загрузка...</p>
        </div>
      </>
    );
  }

  if (!event) {
    return (
      <>
        <Navbar />
        <div className={styles.page}>
          <p className={styles.empty}>Событие не найдено</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link to="/" className={styles.breadcrumbLink}>Афиша</Link>
          <span className={styles.sep}>›</span>
          <span className={styles.breadcrumbCurrent}>{event.title}</span>
        </nav>

        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{event.title}</h1>
            <p className={styles.subtitle}>
              Участники&nbsp;
              <span className={styles.count}>{participants.length}</span>
            </p>
          </div>
          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.btnCopy}
              onClick={handleCopyEmails}
              disabled={participants.length === 0}
            >
              Скопировать все email
            </button>
            <button
              type="button"
              className={styles.btnExport}
              onClick={handleExportCSV}
              disabled={participants.length === 0}
            >
              Экспорт CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className={styles.tableWrapper}>
          {participants.length === 0 ? (
            <p className={styles.empty}>Зарегистрированных участников нет</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Имя</th>
                  <th>Email</th>
                  <th>Telegram</th>
                  <th>Дата регистрации</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p, idx) => (
                  <tr key={p.id} className={idx % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                    <td className={styles.cellNum}>{idx + 1}</td>
                    <td className={styles.cellName}>{p.fullName}</td>
                    <td>
                      {p.email ? (
                        <a href={`mailto:${p.email}`} className={styles.emailLink}>{p.email}</a>
                      ) : (
                        <span className={styles.noData}>—</span>
                      )}
                    </td>
                    <td>
                      {p.telegramUsername ? (
                        <a
                          href={`https://t.me/${p.telegramUsername}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.emailLink}
                        >
                          @{p.telegramUsername}
                        </a>
                      ) : (
                        <span className={styles.noData}>—</span>
                      )}
                    </td>
                    <td className={styles.cellDate}>{formatDate(p.registeredAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
