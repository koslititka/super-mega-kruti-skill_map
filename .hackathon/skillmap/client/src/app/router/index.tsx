import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { Profile } from '../../pages/Profile';
import { EventDetail } from '../../pages/EventDetail';
import { Admin } from '../../pages/Admin';
import { ManagerPanel } from '../../pages/ManagerPanel';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { HomePage } from '@/pages/home';
import { EventDetailPage } from '@/pages/event-detail';
import { LoginPage } from '@/pages/login';
import { RegisterPage } from '@/pages/register';
import { ProfilePage } from '@/pages/profile';
import { FavoritesPage } from '@/pages/favorites';
import { OrganizerPage } from '@/pages/organizer';
import { AdminPage } from '@/pages/admin';
import { ConfirmRegistrationPage } from '@/pages/confirm-registration';
import { ForgotPasswordPage } from '@/pages/forgot-password';
import { ResetPasswordPage } from '@/pages/reset-password';
import { Spinner } from '@/shared/ui';

/** Auth-only guard (no role check) */
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

/** Role guard for FSD pages */
const RoleRoute = ({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles: string[];
}) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" />;
  if (!roles.includes(user.role)) return <Navigate to="/" />;
  return <>{children}</>;
};

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/events/:id" element={<EventDetailPage />} />
      <Route path="/event/:id" element={<EventDetail />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/profile"
        element={
          <AuthRoute>
            <ProfilePage />
          </AuthRoute>
        }
      />
      <Route
        path="/favorites"
        element={
          <AuthRoute>
            <FavoritesPage />
          </AuthRoute>
        }
      />
      <Route
        path="/organizer"
        element={
          <RoleRoute roles={['ORGANIZER', 'ADMIN']}>
            <OrganizerPage />
          </RoleRoute>
        }
      />
      {/* /admin — new standalone Admin page with ProtectedRoute */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Admin />
          </ProtectedRoute>
        }
      />
      {/* /admin/fsd — legacy FSD admin panel (keep accessible for now) */}
      <Route
        path="/admin/fsd"
        element={
          <RoleRoute roles={['ADMIN']}>
            <AdminPage />
          </RoleRoute>
        }
      />
      <Route path="/account" element={<Profile />} />
      <Route
        path="/manager/:eventId"
        element={
          <ProtectedRoute allowedRoles={['manager', 'admin']}>
            <ManagerPanel />
          </ProtectedRoute>
        }
      />
      <Route path="/confirm-registration/:token" element={<ConfirmRegistrationPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};
