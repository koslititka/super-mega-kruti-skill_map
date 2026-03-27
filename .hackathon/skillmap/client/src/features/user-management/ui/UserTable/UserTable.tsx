import { useState, useEffect } from 'react';
import { Select } from '@/shared/ui';
import { useToast } from '@/shared/ui';
import { ROLE_LABELS } from '@/shared/config';
import { getAllUsers, updateUserRole } from '../../api';
import styles from './UserTable.module.css';

export const UserTable = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch {
      showToast('Ошибка загрузки пользователей', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId: number, role: string) => {
    try {
      await updateUserRole(userId, role);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
      showToast('Роль обновлена', 'success');
    } catch {
      showToast('Ошибка обновления роли', 'error');
    }
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Имя</th>
            <th>Email</th>
            <th>Класс</th>
            <th>Роль</th>
            <th>Telegram</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.fullName}</td>
              <td>{user.email || '—'}</td>
              <td>{user.grade || '—'}</td>
              <td>
                <Select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  options={Object.entries(ROLE_LABELS).map(([value, label]) => ({
                    value,
                    label,
                  }))}
                />
              </td>
              <td>{user.telegramUsername || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
