import { PrismaClient, Format, EventType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import eventsData from './data/events.json';
import usersData from './data/users.json';

const prisma = new PrismaClient();

const CATEGORIES = [
  'математика',
  'физика',
  'программирование',
  'олимпиадное программирование',
  'Game Development',
  '3D',
  'Data Science & AI',
  'ОГЭ',
  'ЕГЭ',
  'поступление в ВУЗ',
  'ДОД',
  'Веб-разработка',
];

const AGE_GROUPS = ['6-7', '7-9', '8-9', '9-11', '10-11', 'педагоги', 'родители'];

const INTEREST_MAPPING: Record<string, string[]> = {
  IT: ['программирование', 'Веб-разработка', 'Data Science & AI'],
  Игры: ['Game Development'],
  Наука: ['физика', 'математика'],
  Дизайн: ['3D'],
  Аналитика: ['Data Science & AI', 'математика'],
  Образование: ['ОГЭ', 'ЕГЭ', 'поступление в ВУЗ'],
  Медиа: ['Веб-разработка'],
  Предпринимательство: [],
};

const FORMAT_MAP: Record<string, Format> = {
  Онлайн: 'ONLINE',
};

const EVENT_TYPE_MAP: Record<string, EventType> = {
  вебинар: 'WEBINAR',
  курс: 'COURSE',
  профпроба: 'PROFPROBA',
  ДОД: 'DOD',
};

async function main() {
  console.log('Seeding database...');

  // Clear tables
  await prisma.eventView.deleteMany();
  await prisma.userInterest.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.eventAgeGroup.deleteMany();
  await prisma.eventCategory.deleteMany();
  await prisma.event.deleteMany();
  await prisma.ageGroup.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Create categories
  const categories = await Promise.all(
    CATEGORIES.map((name) => prisma.category.create({ data: { name } }))
  );
  const categoryMap = new Map(categories.map((c) => [c.name, c.id]));
  console.log(`Created ${categories.length} categories`);

  // Create age groups
  const ageGroups = await Promise.all(
    AGE_GROUPS.map((name) => prisma.ageGroup.create({ data: { name } }))
  );
  const ageGroupMap = new Map(ageGroups.map((ag) => [ag.name, ag.id]));
  console.log(`Created ${ageGroups.length} age groups`);

  // Create system organizer
  const organizer = await prisma.user.create({
    data: {
      email: 'organizer@skillmap.ru',
      passwordHash: await bcrypt.hash('organizer123', 10),
      fullName: 'Организатор SkillMap',
      role: 'ORGANIZER',
    },
  });
  console.log('Created system organizer');

  // Create admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@skillmap.ru',
      passwordHash: await bcrypt.hash('admin123', 10),
      fullName: 'Администратор SkillMap',
      role: 'ADMIN',
    },
  });
  console.log('Created admin user');

  // Import events
  for (const eventData of eventsData) {
    const format: Format = FORMAT_MAP[eventData.format] || 'OFFLINE';
    const eventType: EventType = EVENT_TYPE_MAP[eventData.event_category] || 'WEBINAR';

    const catNames = eventData.category.split(',').map((s: string) => s.trim());
    const catIds = catNames
      .map((name: string) => categoryMap.get(name))
      .filter((id: number | undefined): id is number => id !== undefined);

    const agNames = eventData.age_group.split(',').map((s: string) => s.trim());
    const agIds = agNames
      .map((name: string) => ageGroupMap.get(name))
      .filter((id: number | undefined): id is number => id !== undefined);

    await prisma.event.create({
      data: {
        title: eventData.title,
        description: eventData.description,
        date: new Date(eventData.date),
        endDate: eventData.end_date ? new Date(eventData.end_date) : null,
        time: eventData.time || null,
        format,
        eventType,
        registrationLink: eventData.registration_link || null,
        organizerEmail: eventData.organizer_email,
        createdById: organizer.id,
        categories: {
          createMany: { data: catIds.map((id: number) => ({ categoryId: id })) },
        },
        ageGroups: {
          createMany: { data: agIds.map((id: number) => ({ ageGroupId: id })) },
        },
      },
    });
  }
  console.log(`Created ${eventsData.length} events`);

  // Import users
  const defaultPassword = await bcrypt.hash('password123', 10);
  for (const userData of usersData) {
    const interestCategoryNames = (userData.interests || []).flatMap(
      (interest: string) => INTEREST_MAPPING[interest] || []
    );
    const uniqueNames = [...new Set(interestCategoryNames)];
    const interestCatIds = uniqueNames
      .map((name) => categoryMap.get(name))
      .filter((id): id is number => id !== undefined);

    await prisma.user.create({
      data: {
        email: userData.email,
        passwordHash: defaultPassword,
        fullName: userData.fullName,
        grade: userData.grade,
        interests: {
          createMany: { data: interestCatIds.map((id) => ({ categoryId: id })) },
        },
      },
    });
  }
  console.log(`Created ${usersData.length} test users`);

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
