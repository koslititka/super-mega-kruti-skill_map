import { Router } from 'express';
import ctrl from './ratings.controller';
import ctrlWrapper from '../../helpers/ctrlWrapper';
import { auth } from '../../middlewares/auth.middleware';
import { optionalAuth } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { rateSchema } from './ratings.validation';

const router = Router();

router.get('/:eventId', ctrlWrapper(ctrl.getEventRatings));
router.get('/:eventId/my', auth, ctrlWrapper(ctrl.getUserRating));
router.post('/:eventId', auth, validate(rateSchema), ctrlWrapper(ctrl.rate));

export default router;
