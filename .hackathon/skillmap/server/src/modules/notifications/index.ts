import { Router } from 'express';
import ctrl from './notifications.controller';
import ctrlWrapper from '../../helpers/ctrlWrapper';
import { auth } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/', auth, ctrlWrapper(ctrl.getAll));
router.get('/unread-count', auth, ctrlWrapper(ctrl.getUnreadCount));
router.patch('/:id/read', auth, ctrlWrapper(ctrl.markAsRead));
router.patch('/read-all', auth, ctrlWrapper(ctrl.markAllAsRead));

export default router;
