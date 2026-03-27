import { RegisterForm } from '@/features/auth';
import styles from './RegisterPage.module.css';

export const RegisterPage = () => {
  return (
    <div className={styles.page}>
      <RegisterForm />
    </div>
  );
};
