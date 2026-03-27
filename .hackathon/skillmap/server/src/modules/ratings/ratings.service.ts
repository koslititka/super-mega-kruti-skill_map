import { PrismaClient } from '@prisma/client';
import HttpError from '../../helpers/HttpError';
import notificationsService from '../notifications/notifications.service';

const prisma = new PrismaClient();

const rate = async (userId: number, eventId: number, rating: number, comment?: string) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new HttpError(404, 'Событие не найдено');

  // Check that event has ended
  const eventEnd = event.endDate || event.date;
  if (new Date(eventEnd) > new Date()) {
    throw new HttpError(400, 'Оценить можно только после завершения мероприятия');
  }

  // Check that user was registered
  const registration = await prisma.registration.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });
  if (!registration || registration.status !== 'REGISTERED') {
    throw new HttpError(403, 'Оценить могут только зарегистрированные участники');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { fullName: true },
  });

  const existing = await prisma.eventRating.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });

  let result;
  if (existing) {
    result = await prisma.eventRating.update({
      where: { id: existing.id },
      data: { rating, comment },
    });
  } else {
    result = await prisma.eventRating.create({
      data: { userId, eventId, rating, comment },
    });
  }

  // Notify event organizer (don't notify if user is the organizer)
  if (event.createdById !== userId) {
    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    await notificationsService.create({
      userId: event.createdById,
      title: 'Новый отзыв',
      message: `${user?.fullName ?? 'Участник'} оценил «${event.title}» на ${stars}`,
      type: 'EVENT_REVIEW',
      link: `/events/${eventId}`,
    });
  }

  return result;
};

const getEventRatings = async (eventId: number) => {
  const ratings = await prisma.eventRating.findMany({
    where: { eventId },
    include: {
      user: { select: { id: true, fullName: true, telegramPhotoUrl: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const avg = ratings.length
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    : 0;

  return {
    ratings: ratings.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      user: r.user,
      createdAt: r.createdAt,
    })),
    averageRating: Math.round(avg * 10) / 10,
    totalRatings: ratings.length,
  };
};

const getUserRating = async (userId: number, eventId: number) => {
  return prisma.eventRating.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });
};

export default { rate, getEventRatings, getUserRating };
