import { Router } from 'express';
import ctrl from './registrations.controller';
import ctrlWrapper from '../../helpers/ctrlWrapper';
import { auth } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/', auth, ctrlWrapper(ctrl.getMyRegistrations));
router.get('/history', auth, ctrlWrapper(ctrl.getHistory));
router.get('/status/:eventId', auth, ctrlWrapper(ctrl.getRegistrationStatus));
router.get('/event/:eventId', auth, ctrlWrapper(ctrl.getEventParticipants));
router.get('/confirm/:token', ctrlWrapper(ctrl.confirmRegistration));
router.post('/:eventId', auth, ctrlWrapper(ctrl.register));
router.delete('/:eventId', auth, ctrlWrapper(ctrl.cancel));

export default router;
