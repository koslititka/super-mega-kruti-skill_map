import axios from 'axios';
import { API_URL } from '@/shared/config';

/** Shared API client for src/components and src/pages (cookie-based auth) */
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export default apiClient;
