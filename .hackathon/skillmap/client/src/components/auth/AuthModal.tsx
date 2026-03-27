import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLocale } from '../../context/LocaleContext';
import { useToast } from '../../context/ToastContext';
import styles from './AuthModal.module.css';

export type AuthMode = 'login' | 'register';

interface AuthModalProps {
  initialMode?: AuthMode;
  onClose: () => void;
}

export function AuthModal({ initialMode = 'login', onClose }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { login, register } = useAuth();
  const { t } = useLocale();
  const { showToast } = useToast();

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const switchMode = () => {
    setMode((m) => (m === 'login' ? 'register' : 'login'));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        showToast('Добро пожаловать!', 'success');
        onClose();
      } else {
        await register({ email, password, fullName });
        showToast('Проверьте почту для подтверждения регистрации', 'success');
        onClose();
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Что-то пошло не так. Попробуйте снова.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose} aria-hidden="true" />
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={mode === 'login' ? t.auth.loginTitle : t.auth.registerTitle}
      >
        <button type="button" className={styles.close} onClick={onClose} aria-label="Закрыть">
          ✕
        </button>

        <h2 className={styles.title}>
          {mode === 'login' ? t.auth.loginTitle : t.auth.registerTitle}
        </h2>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {mode === 'register' && (
            <div className={styles.field}>
              <label className={styles.label}>{t.auth.name}</label>
              <input
                type="text"
                className={styles.input}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                required
                minLength={2}
              />
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label}>{t.auth.email}</label>
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{t.auth.password}</label>
            <input
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              minLength={6}
            />
          </div>

          {error && <p className={styles.formError}>{error}</p>}

          <button type="submit" className={styles.submit} disabled={submitting}>
            {submitting ? '...' : (mode === 'login' ? t.auth.loginTitle : t.auth.registerTitle)}
          </button>
        </form>

        <p className={styles.footer}>
          {mode === 'login' ? t.auth.noAccount : t.auth.hasAccount}{' '}
          <button type="button" className={styles.switchBtn} onClick={switchMode}>
            {mode === 'login' ? t.auth.registerTitle : t.auth.loginTitle}
          </button>
        </p>
      </div>
    </>
  );
}
