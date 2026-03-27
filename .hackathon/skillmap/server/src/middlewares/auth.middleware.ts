import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import HttpError from '../helpers/HttpError';

interface JwtPayload {
  id: number;
  role: string;
}

export const auth = (req: Request, _res: Response, next: NextFunction) => {
  const token = req.cookies?.token;

  if (!token) {
    throw new HttpError(401, 'Не авторизован');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = { id: decoded.id, role: decoded.role as any };
    next();
  } catch {
    throw new HttpError(401, 'Невалидный токен');
  }
};

export const optionalAuth = (req: Request, _res: Response, next: NextFunction) => {
  const token = req.cookies?.token;

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = { id: decoded.id, role: decoded.role as any };
  } catch {
    // Token invalid, continue as guest
  }

  next();
};
