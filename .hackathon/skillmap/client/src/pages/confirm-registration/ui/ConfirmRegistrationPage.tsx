import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Spinner } from '@/shared/ui';
import api from '@/shared/api';
import styles from './ConfirmRegistrationPage.module.css';

export const ConfirmRegistrationPage = () => {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<{ message: string; eventTitle: string } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    api
      .get(`/registrations/confirm/${token}`)
      .then((res) => setResult(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Ошибка подтверждения'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className={styles.page}>
        <Spinner />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {error ? (
          <>
            <h1 className={styles.title}>Ошибка</h1>
            <p className={styles.message}>{error}</p>
          </>
        ) : (
          <>
            <h1 className={styles.title}>Участие подтверждено!</h1>
            <p className={styles.message}>
              Вы успешно подтвердили участие в мероприятии <strong>{result?.eventTitle}</strong>.
            </p>
          </>
        )}
        <Link to="/" className={styles.link}>
          На главную
        </Link>
      </div>
    </div>
  );
};
