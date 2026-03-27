import { Router } from 'express';
import ctrl from './recommendations.controller';
import ctrlWrapper from '../../helpers/ctrlWrapper';
import { auth } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/', auth, ctrlWrapper(ctrl.getRecommendations));

export default router;
