import { Request, Response } from 'express';
import authService from './auth.service';

const setCookie = (res: Response, token: string) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const register = async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  res.status(200).json(result);
};

const verifyEmail = async (req: Request, res: Response) => {
  const { user, token } = await authService.verifyEmail(req.body);
  setCookie(res, token);
  res.status(201).json(user);
};

const resendCode = async (req: Request, res: Response) => {
  const result = await authService.resendCode(req.body.email);
  res.json(result);
};

const login = async (req: Request, res: Response) => {
  const { user, token } = await authService.login(req.body);
  setCookie(res, token);
  res.json(user);
};

const google = async (req: Request, res: Response) => {
  const { user, token } = await authService.googleAuth(req.body);
  setCookie(res, token);
  res.json(user);
};

const logout = async (_req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ message: 'Выход выполнен' });
};

const getMe = async (req: Request, res: Response) => {
  const user = await authService.getMe(req.user!.id);
  res.json(user);
};

const forgotPassword = async (req: Request, res: Response) => {
  const result = await authService.forgotPassword(req.body.email);
  res.json(result);
};

const resetPassword = async (req: Request, res: Response) => {
  const result = await authService.resetPassword(req.body);
  res.json(result);
};

export default { register, verifyEmail, resendCode, login, google, logout, getMe, forgotPassword, resetPassword };
