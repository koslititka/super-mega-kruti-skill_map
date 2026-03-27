import api from '@/shared/api';
import type { User } from '@/shared/types';

export const loginApi = async (body: { email: string; password: string }) => {
  const { data } = await api.post<User>('/auth/login', body);
  return data;
};

export const registerApi = async (body: {
  email: string;
  password: string;
  fullName: string;
  grade?: number;
  interests?: number[];
}) => {
  const { data } = await api.post<{ message: string; email: string }>('/auth/register', body);
  return data;
};

export const verifyEmailApi = async (body: { email: string; code: string }) => {
  const { data } = await api.post<User>('/auth/verify-email', body);
  return data;
};

export const resendCodeApi = async (email: string) => {
  const { data } = await api.post<{ message: string }>('/auth/resend-code', { email });
  return data;
};

export const googleAuthApi = async (body: { credential: string }) => {
  const { data } = await api.post<User>('/auth/google', body);
  return data;
};

export const forgotPasswordApi = async (email: string) => {
  const { data } = await api.post<{ message: string }>('/auth/forgot-password', { email });
  return data;
};

export const resetPasswordApi = async (token: string, password: string) => {
  const { data } = await api.post<{ message: string }>('/auth/reset-password', { token, password });
  return data;
};

export const logoutApi = async () => {
  await api.post('/auth/logout');
};

export const getMeApi = async () => {
  const { data } = await api.get<User>('/auth/me');
  return data;
};
