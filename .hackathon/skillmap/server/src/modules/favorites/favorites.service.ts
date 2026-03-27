import { PrismaClient } from '@prisma/client';
import HttpError from '../../helpers/HttpError';

const prisma = new PrismaClient();

const getAll = async (userId: number) => {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: {
      event: {
        include: {
          categories: { include: { category: true } },
          ageGroups: { include: { ageGroup: true } },
          _count: { select: { registrations: true, favorites: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return favorites.map((f) => ({
    id: f.event.id,
    title: f.event.title,
    description: f.event.description,
    date: f.event.date,
    endDate: f.event.endDate,
    time: f.event.time,
    format: f.event.format,
    eventType: f.event.eventType,
    categories: f.event.categories.map((c) => ({ id: c.category.id, name: c.category.name })),
    ageGroups: f.event.ageGroups.map((a) => ({ id: a.ageGroup.id, name: a.ageGroup.name })),
    registrationCount: f.event._count.registrations,
    favoriteCount: f.event._count.favorites,
    favoritedAt: f.createdAt,
  }));
};

const add = async (userId: number, eventId: number) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new HttpError(404, 'Событие не найдено');

  const existing = await prisma.favorite.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });
  if (existing) throw new HttpError(409, 'Уже в избранном');

  await prisma.favorite.create({ data: { userId, eventId } });
  return { message: 'Добавлено в избранное' };
};

const remove = async (userId: number, eventId: number) => {
  const existing = await prisma.favorite.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });
  if (!existing) throw new HttpError(404, 'Не найдено в избранном');

  await prisma.favorite.delete({
    where: { userId_eventId: { userId, eventId } },
  });
  return { message: 'Удалено из избранного' };
};

export default { getAll, add, remove };
