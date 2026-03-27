/**
 * Thin wrapper over the FSD auth context.
 * All auth state lives in app/providers/AuthProvider.tsx (cookie-based).
 */
import { useAuth as useFSDAuth } from '@/features/auth';

export function useAuth() {
  const auth = useFSDAuth();
  return {
    ...auth,
    isAuthenticated: !!auth.user,
  };
}
