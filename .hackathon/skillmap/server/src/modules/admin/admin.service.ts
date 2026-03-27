import { PrismaClient, Role } from '@prisma/client';
import HttpError from '../../helpers/HttpError';

const prisma = new PrismaClient();

const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      fullName: true,
      grade: true,
      role: true,
      telegramUsername: true,
      createdAt: true,
      _count: { select: { registrations: true, favorites: true, createdEvents: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return users;
};

const updateUserRole = async (userId: number, role: Role) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new HttpError(404, 'Пользователь не найден');

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: { id: true, email: true, fullName: true, role: true },
  });

  return updated;
};

const getStats = async () => {
  const [totalUsers, totalEvents, totalRegistrations, totalFavorites] = await Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.registration.count({ where: { status: 'REGISTERED' } }),
    prisma.favorite.count(),
  ]);

  const usersByRole = await prisma.user.groupBy({
    by: ['role'],
    _count: true,
  });

  const eventsByType = await prisma.event.groupBy({
    by: ['eventType'],
    _count: true,
  });

  return {
    totalUsers,
    totalEvents,
    totalRegistrations,
    totalFavorites,
    usersByRole: usersByRole.map((r) => ({ role: r.role, count: r._count })),
    eventsByType: eventsByType.map((e) => ({ type: e.eventType, count: e._count })),
  };
};

export default { getAllUsers, updateUserRole, getStats };
