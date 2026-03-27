import { Request, Response } from 'express';
import usersService from './users.service';

const getProfile = async (req: Request, res: Response) => {
  const user = await usersService.getProfile(req.user!.id);
  res.json(user);
};

const updateProfile = async (req: Request, res: Response) => {
  const user = await usersService.updateProfile(req.user!.id, req.body);
  res.json(user);
};

export default { getProfile, updateProfile };
