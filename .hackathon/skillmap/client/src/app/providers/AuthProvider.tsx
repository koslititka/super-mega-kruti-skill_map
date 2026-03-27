import { useState, useEffect, useCallback, ReactNode } from 'react';
import { AuthContext } from '@/features/auth';
import { loginApi, registerApi, verifyEmailApi, googleAuthApi, logoutApi, getMeApi } from '@/features/auth';
import type { User } from '@/shared/types';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const data = await getMeApi();
      setUser(data);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    getMeApi()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));

    const handleUnauthorized = () => setUser(null);
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email: string, password: string) => {
    const data = await loginApi({ email, password });
    setUser(data);
  };

  const register = async (body: {
    email: string;
    password: string;
    fullName: string;
    grade?: number;
    interests?: number[];
  }) => {
    await registerApi(body);
    // Does not set user — requires email verification
  };

  const verifyEmail = async (email: string, code: string) => {
    const data = await verifyEmailApi({ email, code });
    setUser(data);
  };

  const loginWithGoogle = async (credential: string) => {
    const data = await googleAuthApi({ credential });
    setUser(data);
  };

  const logout = async () => {
    await logoutApi();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, verifyEmail, loginWithGoogle, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
