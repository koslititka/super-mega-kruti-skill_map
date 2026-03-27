import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPasswordApi } from '@/features/auth';
import styles from './ForgotPasswordPage.module.css';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      setError('');
      setLoading(true);
      await forgotPasswordApi(email);
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка отправки');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.form}>
        <h1 className={styles.title}>Восстановление пароля</h1>
        {sent ? (
          <div className={styles.success}>
            <p>Если аккаунт существует, ссылка для сброса отправлена на email.</p>
            <Link to="/login" className={styles.backLink}>Вернуться ко входу</Link>
          </div>
        ) : (
          <>
            <p className={styles.subtitle}>Введите email, и мы отправим ссылку для сброса пароля</p>
            {error && <div className={styles.error}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label className={styles.label}>Email</label>
                <input
                  type="email"
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>
              <button type="submit" className={styles.button} disabled={loading}>
                {loading ? 'Отправка...' : 'Отправить ссылку'}
              </button>
            </form>
            <Link to="/login" className={styles.backLink}>Вернуться ко входу</Link>
          </>
        )}
      </div>
    </div>
  );
};
