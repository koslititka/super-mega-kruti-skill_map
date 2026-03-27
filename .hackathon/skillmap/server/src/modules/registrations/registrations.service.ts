import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import HttpError from '../../helpers/HttpError';
import emailService from '../email/email.service';
import notificationsService from '../notifications/notifications.service';

const prisma = new PrismaClient();

const register = async (userId: number, eventId: number) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new HttpError(404, 'Событие не найдено');

  const existing = await prisma.registration.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });

  if (existing && existing.status === 'REGISTERED') {
    throw new HttpError(409, 'Вы уже зарегистрированы на это событие');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const confirmToken = uuidv4();

  if (existing) {
    const updated = await prisma.registration.update({
      where: { id: existing.id },
      data: { status: 'PENDING', confirmToken },
    });

    if (user?.email) {
      emailService.sendRegistrationConfirmation(user.email, event.title, confirmToken, event.registrationLink).catch((err) => {
        console.error('[EMAIL ERROR] Failed to send registration confirmation:', err);
      });
    }

    return updated;
  }

  const registration = await prisma.registration.create({
    data: { userId, eventId, confirmToken },
  });

  if (user?.email) {
    emailService.sendRegistrationConfirmation(user.email, event.title, confirmToken, event.registrationLink).catch((err) => {
      console.error('[EMAIL ERROR] Failed to send registration confirmation:', err);
    });
  }

  return registration;
};

const confirmRegistration = async (token: string) => {
  const registration = await prisma.registration.findUnique({
    where: { confirmToken: token },
    include: { event: true },
  });

  if (!registration) {
    throw new HttpError(404, 'Регистрация не найдена');
  }

  if (registration.status === 'REGISTERED') {
    return { message: 'Участие уже подтверждено', eventTitle: registration.event.title, registrationStatus: 'REGISTERED', eventId: registration.eventId };
  }

  await prisma.registration.update({
    where: { id: registration.id },
    data: {
      status: 'REGISTERED',
      confirmedAt: new Date(),
      confirmToken: null,
    },
  });

  await notificationsService.create({
    userId: registration.userId,
    title: 'Регистрация подтверждена',
    message: `Вы успешно зарегистрированы на «${registration.event.title}»`,
    type: 'REGISTRATION_CONFIRMED',
    link: `/events/${registration.eventId}`,
  });

  return { message: 'Участие подтверждено', eventTitle: registration.event.title, registrationStatus: 'REGISTERED', eventId: registration.eventId };
};

const cancel = async (userId: number, eventId: number) => {
  const existing = await prisma.registration.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });

  if (!existing || existing.status === 'CANCELLED') {
    throw new HttpError(404, 'Регистрация не найдена');
  }

  const updated = await prisma.registration.update({
    where: { id: existing.id },
    data: { status: 'CANCELLED' },
  });
  return updated;
};

const getMyRegistrations = async (userId: number) => {
  const registrations = await prisma.registration.findMany({
    where: { userId, status: { in: ['REGISTERED', 'PENDING'] } },
    include: {
      event: {
        include: {
          categories: { include: { category: true } },
          ageGroups: { include: { ageGroup: true } },
          _count: { select: { registrations: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return registrations.map((r) => ({
    id: r.event.id,
    title: r.event.title,
    description: r.event.description,
    date: r.event.date,
    endDate: r.event.endDate,
    time: r.event.time,
    format: r.event.format,
    eventType: r.event.eventType,
    registrationLink: r.event.registrationLink,
    categories: r.event.categories.map((c) => ({ id: c.category.id, name: c.category.name })),
    ageGroups: r.event.ageGroups.map((a) => ({ id: a.ageGroup.id, name: a.ageGroup.name })),
    registrationCount: r.event._count.registrations,
    registrationStatus: r.status,
    registeredAt: r.createdAt,
  }));
};

const getEventParticipants = async (eventId: number, userId: number, userRole: string) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new HttpError(404, 'Событие не найдено');

  if (event.createdById !== userId && userRole !== 'ADMIN') {
    throw new HttpError(403, 'Нет прав на просмотр участников');
  }

  const participants = await prisma.registration.findMany({
    where: { eventId, status: { in: ['REGISTERED', 'PENDING'] } },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          grade: true,
          telegramUsername: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return participants.map((p) => ({
    id: p.user.id,
    fullName: p.user.fullName,
    email: p.user.email,
    grade: p.user.grade,
    telegramUsername: p.user.telegramUsername,
    status: p.status,
    registeredAt: p.createdAt,
  }));
};

const getHistory = async (userId: number) => {
  const now = new Date();

  const registrations = await prisma.registration.findMany({
    where: {
      userId,
      status: 'REGISTERED',
      event: {
        OR: [
          { endDate: { lt: now } },
          { endDate: null, date: { lt: now } },
        ],
      },
    },
    include: {
      event: {
        include: {
          categories: { include: { category: true } },
          ageGroups: { include: { ageGroup: true } },
          _count: { select: { registrations: true, favorites: true } },
          ratings: { where: { userId }, take: 1 },
        },
      },
    },
    orderBy: { event: { date: 'desc' } },
  });

  return registrations.map((r) => ({
    id: r.event.id,
    title: r.event.title,
    description: r.event.description,
    date: r.event.date,
    endDate: r.event.endDate,
    time: r.event.time,
    format: r.event.format,
    eventType: r.event.eventType,
    registrationLink: r.event.registrationLink,
    organizerEmail: r.event.organizerEmail,
    categories: r.event.categories.map((c) => ({ id: c.category.id, name: c.category.name })),
    ageGroups: r.event.ageGroups.map((a) => ({ id: a.ageGroup.id, name: a.ageGroup.name })),
    registrationCount: r.event._count.registrations,
    favoriteCount: r.event._count.favorites,
    userRating: r.event.ratings[0]?.rating ?? null,
  }));
};

const getRegistrationStatus = async (userId: number, eventId: number) => {
  const registration = await prisma.registration.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });
  return {
    status: registration?.status ?? null,
    confirmedAt: registration?.confirmedAt ?? null,
  };
};

export default { register, confirmRegistration, cancel, getMyRegistrations, getEventParticipants, getHistory, getRegistrationStatus };
