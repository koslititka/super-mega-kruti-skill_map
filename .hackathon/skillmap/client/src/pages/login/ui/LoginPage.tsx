import { LoginForm } from '@/features/auth';
import styles from './LoginPage.module.css';

export const LoginPage = () => {
  return (
    <div className={styles.page}>
      <LoginForm />
    </div>
  );
};
