import { useState } from 'react';
import { Button, Badge } from '@/shared/ui';
import { useToast } from '@/shared/ui';
import { useAuth } from '@/features/auth';
import { registerForEvent, cancelRegistration } from '../../api';
import styles from './RegisterButton.module.css';

interface RegisterButtonProps {
  eventId: number;
  registrationStatus: 'PENDING' | 'REGISTERED' | null;
  registrationLink?: string | null;
  onToggle?: () => void;
}

export const RegisterButton = ({
  eventId,
  registrationStatus,
  registrationLink,
  onToggle,
}: RegisterButtonProps) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(registrationStatus);

  const handleRegister = async () => {
    if (!user) {
      showToast('Войдите, чтобы зарегистрироваться', 'info');
      return;
    }

    try {
      setLoading(true);
      await registerForEvent(eventId);
      setStatus('PENDING');
      showToast('Письмо с подтверждением отправлено на ваш email', 'success');
      onToggle?.();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Ошибка', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setLoading(true);
      await cancelRegistration(eventId);
      setStatus(null);
      showToast('Регистрация отменена', 'info');
      onToggle?.();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Ошибка', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {status === 'REGISTERED' ? (
        <>
          <Badge variant="success">Вы зарегистрированы ✓</Badge>
          <Button variant="ghost" onClick={handleCancel} loading={loading} size="sm">
            Отменить регистрацию
          </Button>
        </>
      ) : status === 'PENDING' ? (
        <>
          <Badge variant="warning">Ожидает подтверждения по email</Badge>
          <Button variant="ghost" onClick={handleCancel} loading={loading} size="sm">
            Отменить регистрацию
          </Button>
        </>
      ) : (
        <Button variant="primary" onClick={handleRegister} loading={loading} size="lg">
          Я пойду!
        </Button>
      )}
      {registrationLink && (
        <a href={registrationLink} target="_blank" rel="noopener noreferrer" className={styles.extLink}>
          Перейти на внешнюю регистрацию
        </a>
      )}
    </div>
  );
};
