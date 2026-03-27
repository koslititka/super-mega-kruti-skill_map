import { Request, Response } from 'express';
import favoritesService from './favorites.service';

const getAll = async (req: Request, res: Response) => {
  const favorites = await favoritesService.getAll(req.user!.id);
  res.json(favorites);
};

const add = async (req: Request, res: Response) => {
  const result = await favoritesService.add(req.user!.id, parseInt(req.params.eventId));
  res.status(201).json(result);
};

const remove = async (req: Request, res: Response) => {
  const result = await favoritesService.remove(req.user!.id, parseInt(req.params.eventId));
  res.json(result);
};

export default { getAll, add, remove };
