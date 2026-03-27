import { PrismaClient } from '@prisma/client';
import HttpError from '../../helpers/HttpError';

const prisma = new PrismaClient();

const getProfile = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { interests: { include: { category: true } } },
  });

  if (!user) throw new HttpError(404, 'Пользователь не найден');

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    grade: user.grade,
    age: user.age,
    role: user.role,
    telegramId: user.telegramId,
    telegramUsername: user.telegramUsername,
    telegramPhotoUrl: user.telegramPhotoUrl,
    interests: user.interests.map((i) => ({ id: i.category.id, name: i.category.name })),
    createdAt: user.createdAt,
  };
};

const updateProfile = async (userId: number, data: any) => {
  const { interests, ...rest } = data;

  if (interests !== undefined) {
    await prisma.userInterest.deleteMany({ where: { userId } });
    if (interests.length > 0) {
      await prisma.userInterest.createMany({
        data: interests.map((categoryId: number) => ({ userId, categoryId })),
      });
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: rest,
    include: { interests: { include: { category: true } } },
  });

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    grade: user.grade,
    age: user.age,
    role: user.role,
    telegramId: user.telegramId,
    telegramUsername: user.telegramUsername,
    telegramPhotoUrl: user.telegramPhotoUrl,
    interests: user.interests.map((i) => ({ id: i.category.id, name: i.category.name })),
    createdAt: user.createdAt,
  };
};

export default { getProfile, updateProfile };
