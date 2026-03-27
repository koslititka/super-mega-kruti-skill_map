import { Request, Response } from 'express';
import ratingsService from './ratings.service';

const rate = async (req: Request, res: Response) => {
  const result = await ratingsService.rate(
    req.user!.id,
    parseInt(req.params.eventId),
    req.body.rating,
    req.body.comment
  );
  res.status(201).json(result);
};

const getEventRatings = async (req: Request, res: Response) => {
  const result = await ratingsService.getEventRatings(parseInt(req.params.eventId));
  res.json(result);
};

const getUserRating = async (req: Request, res: Response) => {
  const result = await ratingsService.getUserRating(req.user!.id, parseInt(req.params.eventId));
  res.json(result);
};

export default { rate, getEventRatings, getUserRating };
