const EVENT_TYPE_LABELS: Record<string, string> = {
  WEBINAR: 'Вебинар',
  COURSE: 'Курс',
  PROFPROBA: 'Профпроба',
  DOD: 'День открытых дверей',
};

const FORMAT_LABELS: Record<string, string> = {
  ONLINE: 'Онлайн',
  OFFLINE: 'Очно',
};

export const buildGoogleCalendarUrl = (event: {
  id: number;
  title: string;
  description?: string;
  date: string;
  endDate?: string | null;
  time?: string | null;
  format?: 'ONLINE' | 'OFFLINE';
  eventType?: string;
  organizerEmail?: string;
}): string => {
  const startDate = new Date(event.date);

  // If event.time (e.g. "14:00") is set and the stored date has no meaningful
  // time component (stored as midnight UTC), apply the time string.
  if (event.time) {
    const match = event.time.match(/^(\d{1,2}):(\d{2})$/);
    if (match) {
      const [, h, m] = match.map(Number);
      const hoursUTC = startDate.getUTCHours();
      const minutesUTC = startDate.getUTCMinutes();
      if (hoursUTC === 0 && minutesUTC === 0) {
        // Treat time as Moscow time (UTC+3) since Innopolis is in that zone
        startDate.setUTCHours(h - 3, m, 0, 0);
      }
    }
  }

  const endDate = event.endDate
    ? new Date(event.endDate)
    : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

  const formatDateForCalendar = (d: Date) =>
    d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  // Build description with event metadata
  const lines: string[] = [];
  if (event.eventType) {
    lines.push(`Тип: ${EVENT_TYPE_LABELS[event.eventType] ?? event.eventType}`);
  }
  if (event.format) {
    lines.push(`Формат: ${FORMAT_LABELS[event.format] ?? event.format}`);
  }
  if (event.time) {
    lines.push(`Время начала: ${event.time}`);
  }
  if (event.organizerEmail) {
    lines.push(`Организатор: ${event.organizerEmail}`);
  }
  if (event.description) {
    lines.push('', event.description);
  }
  lines.push('', `Подробнее: ${window.location.origin}/events/${event.id}`);

  // Location: offline events are held at Innopolis University
  const location =
    event.format === 'OFFLINE'
      ? 'Университет Иннополис, г. Иннополис, Республика Татарстан, Россия'
      : event.format === 'ONLINE'
      ? 'Онлайн'
      : '';

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatDateForCalendar(startDate)}/${formatDateForCalendar(endDate)}`,
    details: lines.join('\n'),
  });

  if (location) {
    params.set('location', location);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};
