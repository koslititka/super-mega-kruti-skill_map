import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { resetPasswordApi } from '@/features/auth';
import styles from './ResetPasswordPage.module.css';

export const ResetPasswordPage = () => {
  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return;
    }
    if (password !== confirm) {
      setError('Пароли не совпадают');
      return;
    }
    if (!token) {
      setError('Ссылка недействительна');
      return;
    }
    try {
      setError('');
      setLoading(true);
      await resetPasswordApi(token, password);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ссылка недействительна или просрочена');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.form}>
        <h1 className={styles.title}>Новый пароль</h1>
        {success ? (
          <div className={styles.success}>
            <p>Пароль успешно изменён!</p>
            <Link to="/login" className={styles.backLink}>Войти</Link>
          </div>
        ) : (
          <>
            {error && <div className={styles.error}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label className={styles.label}>Новый пароль</label>
                <input
                  type="password"
                  className={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Минимум 6 символов"
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Повторите пароль</label>
                <input
                  type="password"
                  className={styles.input}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Повторите пароль"
                  required
                />
              </div>
              <button type="submit" className={styles.button} disabled={loading}>
                {loading ? 'Сохранение...' : 'Сохранить пароль'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
