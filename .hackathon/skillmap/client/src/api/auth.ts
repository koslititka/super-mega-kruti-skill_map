import apiClient from './index';
import type { User } from '@/shared/types';

export const login = (data: { email: string; password: string }) =>
  apiClient.post<User>('/auth/login', data).then((r) => r.data);

export const register = (data: {
  email: string;
  password: string;
  fullName: string;
  grade?: number;
  interests?: number[];
}) => apiClient.post<{ message: string; email: string }>('/auth/register', data).then((r) => r.data);

export const logout = () =>
  apiClient.post('/auth/logout').then((r) => r.data);

export const getMe = () =>
  apiClient.get<User>('/auth/me').then((r) => r.data);

export const forgotPassword = (email: string) =>
  apiClient.post('/auth/forgot-password', { email }).then((r) => r.data);

export const resetPassword = (token: string, password: string) =>
  apiClient.post('/auth/reset-password', { token, password }).then((r) => r.data);

export const verifyEmail = (email: string, code: string) =>
  apiClient.post('/auth/verify-email', { email, code }).then((r) => r.data);

export const resendCode = (email: string) =>
  apiClient.post('/auth/resend-code', { email }).then((r) => r.data);
