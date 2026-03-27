import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRouter from './modules/auth';
import usersRouter from './modules/users';
import eventsRouter from './modules/events';
import favoritesRouter from './modules/favorites';
import registrationsRouter from './modules/registrations';
import recommendationsRouter from './modules/recommendations';
import categoriesRouter from './modules/categories';
import adminRouter from './modules/admin';
import notificationsRouter from './modules/notifications';
import ratingsRouter from './modules/ratings';
import { errorMiddleware } from './middlewares/error.middleware';

const app = express();

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? true
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/events', eventsRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/registrations', registrationsRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/admin', adminRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/ratings', ratingsRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Error handler
app.use(errorMiddleware);

export default app;
