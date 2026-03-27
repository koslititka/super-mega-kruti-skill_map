import { useState, useEffect } from 'react';
import { getStats } from '@/features/user-management';
import { Spinner } from '@/shared/ui';
import { ROLE_LABELS, EVENT_TYPE_LABELS } from '@/shared/config';
import type { Stats } from '@/shared/types';
import styles from './AdminDashboard.module.css';

export const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!stats) return null;

  return (
    <div className={styles.dashboard}>
      <div className={styles.cards}>
        <div className={styles.card}>
          <div className={styles.cardValue}>{stats.totalUsers}</div>
          <div className={styles.cardLabel}>Пользователей</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardValue}>{stats.totalEvents}</div>
          <div className={styles.cardLabel}>Мероприятий</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardValue}>{stats.totalRegistrations}</div>
          <div className={styles.cardLabel}>Регистраций</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardValue}>{stats.totalFavorites}</div>
          <div className={styles.cardLabel}>В избранном</div>
        </div>
      </div>
      <div className={styles.details}>
        <div className={styles.detail}>
          <h3>По ролям</h3>
          {stats.usersByRole.map((r) => (
            <div key={r.role} className={styles.detailRow}>
              <span>{ROLE_LABELS[r.role] || r.role}</span>
              <span className={styles.detailValue}>{r.count}</span>
            </div>
          ))}
        </div>
        <div className={styles.detail}>
          <h3>По типам мероприятий</h3>
          {stats.eventsByType.map((e) => (
            <div key={e.type} className={styles.detailRow}>
              <span>{EVENT_TYPE_LABELS[e.type] || e.type}</span>
              <span className={styles.detailValue}>{e.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
