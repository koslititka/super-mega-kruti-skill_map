import { Request, Response } from 'express';
import notificationsService from './notifications.service';

const getAll = async (req: Request, res: Response) => {
  const notifications = await notificationsService.getByUserId(req.user!.id);
  res.json(notifications);
};

const getUnreadCount = async (req: Request, res: Response) => {
  const count = await notificationsService.getUnreadCount(req.user!.id);
  res.json({ count });
};

const markAsRead = async (req: Request, res: Response) => {
  await notificationsService.markAsRead(parseInt(req.params.id), req.user!.id);
  res.json({ message: 'Прочитано' });
};

const markAllAsRead = async (req: Request, res: Response) => {
  await notificationsService.markAllAsRead(req.user!.id);
  res.json({ message: 'Все уведомления прочитаны' });
};

export default { getAll, getUnreadCount, markAsRead, markAllAsRead };
