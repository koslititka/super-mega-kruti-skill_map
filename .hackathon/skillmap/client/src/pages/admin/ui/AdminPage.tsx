import { useState } from 'react';
import { AdminDashboard } from '@/widgets/admin-dashboard';
import { UserTable } from '@/features/user-management';
import styles from './AdminPage.module.css';

export const AdminPage = () => {
  const [tab, setTab] = useState<'dashboard' | 'users'>('dashboard');

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Администрирование</h1>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === 'dashboard' ? styles.active : ''}`}
          onClick={() => setTab('dashboard')}
        >
          Статистика
        </button>
        <button
          className={`${styles.tab} ${tab === 'users' ? styles.active : ''}`}
          onClick={() => setTab('users')}
        >
          Пользователи
        </button>
      </div>
      <div className={styles.content}>
        {tab === 'dashboard' && <AdminDashboard />}
        {tab === 'users' && <UserTable />}
      </div>
    </div>
  );
};
