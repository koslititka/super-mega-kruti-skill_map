import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from './ProtectedRoute.module.css';

const ROLE_MAP: Record<string, string> = {
  admin: 'ADMIN',
  manager: 'ORGANIZER',
};

interface ProtectedRouteProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className={styles.spinnerWrap}>
        <span className={styles.spinner} aria-label="Загрузка..." />
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;

  const allowed = allowedRoles.map((r) => ROLE_MAP[r] ?? r);
  if (!allowed.includes(user.role)) return <Navigate to="/" replace />;

  return <>{children}</>;
}
