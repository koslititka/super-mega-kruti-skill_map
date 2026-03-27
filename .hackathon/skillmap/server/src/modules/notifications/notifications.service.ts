import { PrismaClient, NotificationType } from '@prisma/client';

const prisma = new PrismaClient();

const getByUserId = async (userId: number) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
};

const getUnreadCount = async (userId: number) => {
  return prisma.notification.count({
    where: { userId, read: false },
  });
};

const markAsRead = async (id: number, userId: number) => {
  return prisma.notification.updateMany({
    where: { id, userId },
    data: { read: true },
  });
};

const markAllAsRead = async (userId: number) => {
  return prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
};

const create = async (data: {
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
}) => {
  return prisma.notification.create({ data });
};

export default { getByUserId, getUnreadCount, markAsRead, markAllAsRead, create };
