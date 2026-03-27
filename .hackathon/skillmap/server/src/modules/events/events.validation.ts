import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().min(3, 'Название должно быть не менее 3 символов'),
  description: z.string().min(10, 'Описание должно быть не менее 10 символов'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Некорректная дата'),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Некорректная дата').optional().nullable(),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Формат времени: HH:mm').optional().nullable(),
  format: z.enum(['ONLINE', 'OFFLINE']),
  eventType: z.enum(['WEBINAR', 'COURSE', 'PROFPROBA', 'DOD']),
  registrationLink: z.string().url().optional().nullable(),
  organizerEmail: z.string().email('Некорректный email организатора'),
  categoryIds: z.array(z.number().int()).min(1, 'Выберите хотя бы одну категорию'),
  ageGroupIds: z.array(z.number().int()).min(1, 'Выберите хотя бы одну возрастную группу'),
});

export const updateEventSchema = createEventSchema.partial();
