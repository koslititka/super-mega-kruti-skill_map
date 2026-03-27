import { Request, Response } from 'express';
import categoriesService from './categories.service';

const getAll = async (_req: Request, res: Response) => {
  const categories = await categoriesService.getAll();
  res.json(categories);
};

const getAllAgeGroups = async (_req: Request, res: Response) => {
  const ageGroups = await categoriesService.getAllAgeGroups();
  res.json(ageGroups);
};

export default { getAll, getAllAgeGroups };
