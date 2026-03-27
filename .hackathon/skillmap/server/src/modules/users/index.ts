import { Router } from 'express';
import ctrl from './users.controller';
import ctrlWrapper from '../../helpers/ctrlWrapper';
import { auth } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { updateProfileSchema } from './users.validation';

const router = Router();

router.get('/me', auth, ctrlWrapper(ctrl.getProfile));
router.put('/me', auth, validate(updateProfileSchema), ctrlWrapper(ctrl.updateProfile));

export default router;
