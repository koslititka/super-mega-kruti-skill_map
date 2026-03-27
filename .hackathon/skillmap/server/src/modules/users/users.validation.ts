import { z } from 'zod';

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  grade: z.number().int().min(6).max(11).optional().nullable(),
  age: z.number().int().min(0).max(100).optional().nullable(),
  telegramUsername: z.string().optional().nullable(),
  interests: z.array(z.number().int()).optional(),
});
