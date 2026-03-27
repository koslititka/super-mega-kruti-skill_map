import { Router } from 'express';
import ctrl from './favorites.controller';
import ctrlWrapper from '../../helpers/ctrlWrapper';
import { auth } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/', auth, ctrlWrapper(ctrl.getAll));
router.post('/:eventId', auth, ctrlWrapper(ctrl.add));
router.delete('/:eventId', auth, ctrlWrapper(ctrl.remove));

export default router;
