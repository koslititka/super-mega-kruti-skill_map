import { PrismaClient, Prisma } from '@prisma/client';
import HttpError from '../../helpers/HttpError';

const prisma = new PrismaClient();

const eventInclude = {
  categories: { include: { category: true } },
  ageGroups: { include: { ageGroup: true } },
  createdBy: { select: { id: true, fullName: true, email: true } },
  _count: { select: { registrations: true, favorites: true } },
};

const getAll = async (query: any) => {
  const {
    search,
    categories,
    format,
    ageGroups,
    eventType,
    dateFrom,
    dateTo,
    page = '1',
    limit = '20',
    sort = 'date_asc',
  } = query;

  const where: Prisma.EventWhereInput = {};

  if (search) {
    where.title = { contains: search, mode: 'insensitive' };
  }

  if (categories) {
    const catIds = String(categories).split(',').map(Number);
    where.categories = { some: { categoryId: { in: catIds } } };
  }

  if (format) {
    where.format = format;
  }

  if (ageGroups) {
    const agIds = String(ageGroups).split(',').map(Number);
    where.ageGroups = { some: { ageGroupId: { in: agIds } } };
  }

  if (eventType) {
    where.eventType = eventType;
  }

  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) where.date.gte = new Date(dateFrom);
    if (dateTo) where.date.lte = new Date(dateTo);
  }

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const orderBy: Prisma.EventOrderByWithRelationInput =
    sort === 'date_desc' ? { date: 'desc' } : { date: 'asc' };

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      include: eventInclude,
      orderBy,
      skip,
      take: limitNum,
    }),
    prisma.event.count({ where }),
  ]);

  return {
    events: events.map(formatEvent),
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

const getById = async (id: string) => {
  const event = await prisma.event.findUnique({
    where: { id: parseInt(id) },
    include: eventInclude,
  });

  if (!event) {
    throw new HttpError(404, 'Событие не найдено');
  }

  return formatEvent(event);
};

const create = async (data: any, userId: number) => {
  const { categoryIds, ageGroupIds, date, endDate, ...rest } = data;

  const event = await prisma.event.create({
    data: {
      ...rest,
      date: new Date(date),
      endDate: endDate ? new Date(endDate) : null,
      createdById: userId,
      categories: {
        createMany: { data: categoryIds.map((id: number) => ({ categoryId: id })) },
      },
      ageGroups: {
        createMany: { data: ageGroupIds.map((id: number) => ({ ageGroupId: id })) },
      },
    },
    include: eventInclude,
  });

  return formatEvent(event);
};

const update = async (id: string, data: any, userId: number, userRole: string) => {
  const event = await prisma.event.findUnique({ where: { id: parseInt(id) } });

  if (!event) {
    throw new HttpError(404, 'Событие не найдено');
  }

  if (event.createdById !== userId && userRole !== 'ADMIN') {
    throw new HttpError(403, 'Нет прав на редактирование этого события');
  }

  const { categoryIds, ageGroupIds, date, endDate, ...rest } = data;

  const updateData: any = { ...rest };
  if (date) updateData.date = new Date(date);
  if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;

  if (categoryIds) {
    await prisma.eventCategory.deleteMany({ where: { eventId: parseInt(id) } });
    updateData.categories = {
      createMany: { data: categoryIds.map((cid: number) => ({ categoryId: cid })) },
    };
  }

  if (ageGroupIds) {
    await prisma.eventAgeGroup.deleteMany({ where: { eventId: parseInt(id) } });
    updateData.ageGroups = {
      createMany: { data: ageGroupIds.map((aid: number) => ({ ageGroupId: aid })) },
    };
  }

  const updated = await prisma.event.update({
    where: { id: parseInt(id) },
    data: updateData,
    include: eventInclude,
  });

  return formatEvent(updated);
};

const remove = async (id: string, userId: number, userRole: string) => {
  const event = await prisma.event.findUnique({ where: { id: parseInt(id) } });

  if (!event) {
    throw new HttpError(404, 'Событие не найдено');
  }

  if (event.createdById !== userId && userRole !== 'ADMIN') {
    throw new HttpError(403, 'Нет прав на удаление этого события');
  }

  await prisma.event.delete({ where: { id: parseInt(id) } });
  return { message: 'Событие удалено' };
};

const getSimilar = async (id: string) => {
  const event = await prisma.event.findUnique({
    where: { id: parseInt(id) },
    include: {
      categories: true,
      ageGroups: true,
    },
  });

  if (!event) {
    throw new HttpError(404, 'Событие не найдено');
  }

  const categoryIds = event.categories.map((c) => c.categoryId);
  const ageGroupIds = event.ageGroups.map((a) => a.ageGroupId);

  const similar = await prisma.event.findMany({
    where: {
      id: { not: event.id },
      OR: [
        { categories: { some: { categoryId: { in: categoryIds } } } },
        { ageGroups: { some: { ageGroupId: { in: ageGroupIds } } } },
      ],
    },
    include: eventInclude,
    take: 6,
    orderBy: { date: 'asc' },
  });

  return similar.map(formatEvent);
};

const recordView = async (eventId: string, userId?: number) => {
  await prisma.eventView.create({
    data: {
      eventId: parseInt(eventId),
      userId: userId || null,
    },
  });
  return { message: 'Просмотр зафиксирован' };
};

const formatEvent = (event: any) => ({
  id: event.id,
  title: event.title,
  description: event.description,
  date: event.date,
  endDate: event.endDate,
  time: event.time,
  format: event.format,
  eventType: event.eventType,
  registrationLink: event.registrationLink,
  organizerEmail: event.organizerEmail,
  createdBy: event.createdBy,
  categories: event.categories?.map((c: any) => ({
    id: c.category.id,
    name: c.category.name,
  })) || [],
  ageGroups: event.ageGroups?.map((a: any) => ({
    id: a.ageGroup.id,
    name: a.ageGroup.name,
  })) || [],
  registrationCount: event._count?.registrations || 0,
  favoriteCount: event._count?.favorites || 0,
  createdAt: event.createdAt,
});

export default { getAll, getById, create, update, remove, getSimilar, recordView };
