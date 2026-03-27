import { Router } from 'express';
import ctrl from './categories.controller';
import ctrlWrapper from '../../helpers/ctrlWrapper';

const router = Router();

router.get('/', ctrlWrapper(ctrl.getAll));
router.get('/age-groups', ctrlWrapper(ctrl.getAllAgeGroups));

export default router;
