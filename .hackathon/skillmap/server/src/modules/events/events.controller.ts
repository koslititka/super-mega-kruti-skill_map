import { Request, Response } from 'express';
import eventsService from './events.service';

const getAll = async (req: Request, res: Response) => {
  const result = await eventsService.getAll(req.query);
  res.json(result);
};

const getById = async (req: Request, res: Response) => {
  const event = await eventsService.getById(req.params.id);
  res.json(event);
};

const create = async (req: Request, res: Response) => {
  const event = await eventsService.create(req.body, req.user!.id);
  res.status(201).json(event);
};

const update = async (req: Request, res: Response) => {
  const event = await eventsService.update(req.params.id, req.body, req.user!.id, req.user!.role);
  res.json(event);
};

const remove = async (req: Request, res: Response) => {
  const result = await eventsService.remove(req.params.id, req.user!.id, req.user!.role);
  res.json(result);
};

const getSimilar = async (req: Request, res: Response) => {
  const events = await eventsService.getSimilar(req.params.id);
  res.json(events);
};

const recordView = async (req: Request, res: Response) => {
  const result = await eventsService.recordView(req.params.id, req.user?.id);
  res.json(result);
};

export default { getAll, getById, create, update, remove, getSimilar, recordView };
