import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import HttpError from '../helpers/HttpError';

export const validate = (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const message = result.error.errors.map((e) => e.message).join(', ');
      throw new HttpError(400, message);
    }

    req[source] = result.data;
    next();
  };
};
