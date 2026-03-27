import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
  fullName: z.string().min(2, 'Имя должно быть не менее 2 символов'),
  grade: z.number().int().min(6).max(11).optional(),
  interests: z.array(z.number().int()).optional(),
});

export const verifyEmailSchema = z.object({
  email: z.string().email('Некорректный email'),
  code: z.string().length(6, 'Код должен быть 6 цифр'),
});

export const resendCodeSchema = z.object({
  email: z.string().email('Некорректный email'),
});

export const loginSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(1, 'Введите пароль'),
});

export const googleSchema = z.object({
  credential: z.string().min(1, 'Токен обязателен'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Некорректный email'),
});

export const resetPasswordSchema = z.object({
  token: z.string().uuid('Некорректный токен'),
  password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
});
