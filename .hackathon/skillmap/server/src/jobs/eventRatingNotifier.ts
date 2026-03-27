import { PrismaClient } from '@prisma/client';
import emailService from '../modules/email/email.service';
import notificationsService from '../modules/notifications/notifications.service';
import { env } from '../config/env';

const prisma = new PrismaClient();

const check = async () => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    // For single-day events (no endDate), wait at least 3 hours after start before notifying
    const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);

    const endedEvents = await prisma.event.findMany({
      where: {
        OR: [
          { endDate: { lt: now, gt: sevenDaysAgo } },
          { endDate: null, date: { lt: threeHoursAgo, gt: sevenDaysAgo } },
        ],
      },
    });

    console.log(`[eventRatingNotifier] Check: found ${endedEvents.length} ended events`);

    for (const event of endedEvents) {
      const registrations = await prisma.registration.findMany({
        where: { eventId: event.id, status: 'REGISTERED' },
        include: { user: { select: { id: true, email: true } } },
      });

      for (const reg of registrations) {
        const existing = await prisma.notification.findFirst({
          where: {
            userId: reg.userId,
            type: 'EVENT_RATING',
            link: `/events/${event.id}#rating`,
          },
        });

        if (existing) continue;

        await notificationsService.create({
          userId: reg.userId,
          title: 'Оцените мероприятие',
          message: `Мероприятие "${event.title}" завершилось. Оцените его!`,
          type: 'EVENT_RATING',
          link: `/events/${event.id}#rating`,
        });

        if (reg.user.email) {
          await emailService.sendEventRatingNotification(
            reg.user.email,
            event.title,
            `${env.CLIENT_URL}/events/${event.id}#rating`
          );
        }
      }
    }
  } catch (err) {
    console.error('[eventRatingNotifier] Error:', err);
  }
};

export const startEventRatingNotifier = () => {
  check();
  setInterval(check, 5 * 60 * 1000); // Проверка каждые 5 минут
  console.log('[eventRatingNotifier] Started');
};
