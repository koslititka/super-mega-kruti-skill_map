import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getAll = async () => {
  return prisma.category.findMany({ orderBy: { name: 'asc' } });
};

const getAllAgeGroups = async () => {
  return prisma.ageGroup.findMany({ orderBy: { id: 'asc' } });
};

export default { getAll, getAllAgeGroups };
