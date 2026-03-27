import { Router } from 'express';
import ctrl from './admin.controller';
import ctrlWrapper from '../../helpers/ctrlWrapper';
import { auth } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';

const router = Router();

router.get('/users', auth, requireRole('ADMIN'), ctrlWrapper(ctrl.getAllUsers));
router.put('/users/:id/role', auth, requireRole('ADMIN'), ctrlWrapper(ctrl.updateUserRole));
router.get('/stats', auth, requireRole('ADMIN'), ctrlWrapper(ctrl.getStats));

export default router;
