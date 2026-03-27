import styles from './Toast.module.css';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
}

export function Toast({ message, type }: ToastProps) {
  return (
    <div className={`${styles.toast} ${type === 'success' ? styles.success : styles.error}`}>
      {message}
    </div>
  );
}
