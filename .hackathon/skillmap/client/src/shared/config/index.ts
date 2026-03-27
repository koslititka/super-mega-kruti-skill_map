export const API_URL = import.meta.env.VITE_API_URL || '/api';
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  FAVORITES: '/favorites',
  EVENT_DETAIL: '/events/:id',
  ORGANIZER: '/organizer',
  ADMIN: '/admin',
} as const;

export const EVENT_TYPE_LABELS: Record<string, string> = {
  WEBINAR: 'Вебинар',
  COURSE: 'Курс',
  PROFPROBA: 'Профпроба',
  DOD: 'ДОД',
};

export const FORMAT_LABELS: Record<string, string> = {
  ONLINE: 'Онлайн',
  OFFLINE: 'Очно',
};

export const ROLE_LABELS: Record<string, string> = {
  USER: 'Пользователь',
  ORGANIZER: 'Организатор',
  ADMIN: 'Администратор',
};
