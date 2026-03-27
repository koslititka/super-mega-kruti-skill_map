import { Router } from 'express';
import ctrl from './events.controller';
import ctrlWrapper from '../../helpers/ctrlWrapper';
import { auth, optionalAuth } from '../../middlewares/auth.middleware';
import { requireMinRole } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createEventSchema, updateEventSchema } from './events.validation';

const router = Router();

router.get('/', ctrlWrapper(ctrl.getAll));
router.get('/:id', ctrlWrapper(ctrl.getById));
router.get('/:id/similar', ctrlWrapper(ctrl.getSimilar));
router.post('/:id/view', optionalAuth, ctrlWrapper(ctrl.recordView));
router.post('/', auth, requireMinRole('ORGANIZER'), validate(createEventSchema), ctrlWrapper(ctrl.create));
router.put('/:id', auth, requireMinRole('ORGANIZER'), validate(updateEventSchema), ctrlWrapper(ctrl.update));
router.delete('/:id', auth, ctrlWrapper(ctrl.remove));

export default router;
