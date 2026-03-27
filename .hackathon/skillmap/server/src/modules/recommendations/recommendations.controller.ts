import { Request, Response } from 'express';
import recommendationsService from './recommendations.service';

const getRecommendations = async (req: Request, res: Response) => {
  const recommendations = await recommendationsService.getRecommendations(req.user!.id);
  res.json(recommendations);
};

export default { getRecommendations };
