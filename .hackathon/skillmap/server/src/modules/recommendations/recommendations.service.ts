import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getRecommendations = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      interests: true,
      favorites: { include: { event: { include: { categories: true } } } },
      registrations: { where: { status: 'REGISTERED' } },
    },
  });

  if (!user) return [];

  const userInterestIds = user.interests.map((i) => i.categoryId);
  const favoriteCategoryIds = [
    ...new Set(user.favorites.flatMap((f) => f.event.categories.map((c) => c.categoryId))),
  ];
  const registeredEventIds = user.registrations.map((r) => r.eventId);

  // Get viewed event categories
  const views = await prisma.eventView.findMany({
    where: { userId },
    include: { event: { include: { categories: true } } },
    orderBy: { viewedAt: 'desc' },
    take: 50,
  });
  const viewedCategoryIds = [
    ...new Set(views.flatMap((v) => v.event.categories.map((c) => c.categoryId))),
  ];

  // Get rating-based category preferences
  const userRatings = await prisma.eventRating.findMany({
    where: { userId },
    include: { event: { include: { categories: true } } },
  });
  const likedCategoryIds = [
    ...new Set(
      userRatings
        .filter((r) => r.rating >= 4)
        .flatMap((r) => r.event.categories.map((c) => c.categoryId))
    ),
  ];
  const dislikedCategoryIds = [
    ...new Set(
      userRatings
        .filter((r) => r.rating <= 2)
        .flatMap((r) => r.event.categories.map((c) => c.categoryId))
    ),
  ];

  // Get all upcoming events
  const now = new Date();
  const events = await prisma.event.findMany({
    where: {
      OR: [
        { date: { gte: now } },
        { endDate: { gte: now } },
      ],
    },
    include: {
      categories: { include: { category: true } },
      ageGroups: { include: { ageGroup: true } },
      _count: { select: { registrations: true, favorites: true } },
    },
  });

  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const scored = events.map((event) => {
    let score = 0;
    const eventCategoryIds = event.categories.map((c) => c.categoryId);

    // Interest match (+30 per match)
    const interestMatches = eventCategoryIds.filter((id) => userInterestIds.includes(id)).length;
    score += 30 * interestMatches;

    // Age group match (+25)
    if (user.grade) {
      const ageMatch = event.ageGroups.some((ag) => {
        const parts = ag.ageGroup.name.split('-');
        if (parts.length === 2) {
          const min = parseInt(parts[0]);
          const max = parseInt(parts[1]);
          return user.grade! >= min && user.grade! <= max;
        }
        return false;
      });
      if (ageMatch) score += 25;
    }

    // Liked categories match (+20 per match)
    const likedMatch = eventCategoryIds.filter((id) => likedCategoryIds.includes(id)).length;
    score += 20 * likedMatch;

    // Disliked categories penalty (-15 per match)
    const dislikedMatch = eventCategoryIds.filter((id) => dislikedCategoryIds.includes(id)).length;
    score -= 15 * dislikedMatch;

    // Favorite categories match (+15)
    const favMatch = eventCategoryIds.filter((id) => favoriteCategoryIds.includes(id)).length;
    if (favMatch > 0) score += 15;

    // Viewed categories match (+10)
    const viewMatch = eventCategoryIds.filter((id) => viewedCategoryIds.includes(id)).length;
    if (viewMatch > 0) score += 10;

    // Upcoming bonus (+5)
    if (event.date >= now) score += 5;

    // Soon bonus (+10)
    if (event.date <= weekFromNow) score += 10;

    // Already registered penalty (-100)
    if (registeredEventIds.includes(event.id)) score -= 100;

    return {
      event: {
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        endDate: event.endDate,
        time: event.time,
        format: event.format,
        eventType: event.eventType,
        registrationLink: event.registrationLink,
        categories: event.categories.map((c) => ({ id: c.category.id, name: c.category.name })),
        ageGroups: event.ageGroups.map((a) => ({ id: a.ageGroup.id, name: a.ageGroup.name })),
        registrationCount: event._count.registrations,
        favoriteCount: event._count.favorites,
      },
      score,
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.filter((s) => s.score > 0).slice(0, 10).map((s) => s.event);
};

export default { getRecommendations };
