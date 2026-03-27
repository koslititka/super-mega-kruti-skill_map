import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import HttpError from '../helpers/HttpError';

const roleHierarchy: Record<Role, number> = {
  USER: 0,
  ORGANIZER: 1,
  ADMIN: 2,
};

export const requireRole = (...roles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new HttpError(401, 'Не авторизован');
    }

    if (!roles.includes(req.user.role)) {
      throw new HttpError(403, 'Недостаточно прав');
    }

    next();
  };
};

export const requireMinRole = (minRole: Role) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new HttpError(401, 'Не авторизован');
    }

    if (roleHierarchy[req.user.role] < roleHierarchy[minRole]) {
      throw new HttpError(403, 'Недостаточно прав');
    }

    next();
  };
};
