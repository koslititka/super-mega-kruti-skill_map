import { Request, Response } from 'express';
import registrationsService from './registrations.service';

const register = async (req: Request, res: Response) => {
  const result = await registrationsService.register(req.user!.id, parseInt(req.params.eventId));
  res.status(201).json(result);
};

const confirmRegistration = async (req: Request, res: Response) => {
  const result = await registrationsService.confirmRegistration(req.params.token);
  res.json(result);
};

const cancel = async (req: Request, res: Response) => {
  const result = await registrationsService.cancel(req.user!.id, parseInt(req.params.eventId));
  res.json(result);
};

const getMyRegistrations = async (req: Request, res: Response) => {
  const registrations = await registrationsService.getMyRegistrations(req.user!.id);
  res.json(registrations);
};

const getEventParticipants = async (req: Request, res: Response) => {
  const participants = await registrationsService.getEventParticipants(
    parseInt(req.params.eventId),
    req.user!.id,
    req.user!.role
  );
  res.json(participants);
};

const getHistory = async (req: Request, res: Response) => {
  const history = await registrationsService.getHistory(req.user!.id);
  res.json(history);
};

const getRegistrationStatus = async (req: Request, res: Response) => {
  const result = await registrationsService.getRegistrationStatus(
    req.user!.id,
    parseInt(req.params.eventId)
  );
  res.json(result);
};

export default { register, confirmRegistration, cancel, getMyRegistrations, getEventParticipants, getHistory, getRegistrationStatus };
