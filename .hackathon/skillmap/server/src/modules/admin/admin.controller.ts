import { Request, Response } from 'express';
import adminService from './admin.service';

const getAllUsers = async (_req: Request, res: Response) => {
  const users = await adminService.getAllUsers();
  res.json(users);
};

const updateUserRole = async (req: Request, res: Response) => {
  const user = await adminService.updateUserRole(parseInt(req.params.id), req.body.role);
  res.json(user);
};

const getStats = async (_req: Request, res: Response) => {
  const stats = await adminService.getStats();
  res.json(stats);
};

export default { getAllUsers, updateUserRole, getStats };
