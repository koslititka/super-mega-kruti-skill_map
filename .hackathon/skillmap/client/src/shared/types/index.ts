export interface User {
  id: number;
  email: string | null;
  fullName: string;
  grade: number | null;
  age: number | null;
  role: 'USER' | 'ORGANIZER' | 'ADMIN';
  telegramId: string | null;
  telegramUsername: string | null;
  telegramPhotoUrl: string | null;
  interests: Category[];
  createdAt: string;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  endDate: string | null;
  time: string | null;
  format: 'ONLINE' | 'OFFLINE';
  eventType: 'WEBINAR' | 'COURSE' | 'PROFPROBA' | 'DOD';
  registrationLink: string | null;
  organizerEmail: string;
  createdBy?: { id: number; fullName: string; email: string };
  categories: Category[];
  ageGroups: AgeGroup[];
  registrationCount: number;
  favoriteCount: number;
  createdAt?: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface AgeGroup {
  id: number;
  name: string;
}

export interface PaginatedResponse<T> {
  events: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Participant {
  id: number;
  fullName: string;
  email: string | null;
  grade: number | null;
  telegramUsername: string | null;
  status: 'PENDING' | 'REGISTERED';
  registeredAt: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'EVENT_REMINDER' | 'EVENT_RATING' | 'REGISTRATION_CONFIRMED' | 'SYSTEM' | 'EVENT_REVIEW';
  read: boolean;
  link: string | null;
  createdAt: string;
}

export interface EventRating {
  id: number;
  rating: number;
  comment: string | null;
  user: { id: number; fullName: string; telegramPhotoUrl: string | null };
  createdAt: string;
}

export interface HistoryEvent extends Event {
  userRating: number | null;
}

export interface EventRatingsResponse {
  ratings: EventRating[];
  averageRating: number;
  totalRatings: number;
}

export interface Stats {
  totalUsers: number;
  totalEvents: number;
  totalRegistrations: number;
  totalFavorites: number;
  usersByRole: { role: string; count: number }[];
  eventsByType: { type: string; count: number }[];
}
