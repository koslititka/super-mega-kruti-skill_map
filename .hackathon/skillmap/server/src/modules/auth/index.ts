import { Router } from 'express';
import ctrl from './auth.controller';
import ctrlWrapper from '../../helpers/ctrlWrapper';
import { auth } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { registerSchema, loginSchema, googleSchema, verifyEmailSchema, resendCodeSchema, forgotPasswordSchema, resetPasswordSchema } from './auth.validation';

const router = Router();

router.post('/register', validate(registerSchema), ctrlWrapper(ctrl.register));
router.post('/verify-email', validate(verifyEmailSchema), ctrlWrapper(ctrl.verifyEmail));
router.post('/resend-code', validate(resendCodeSchema), ctrlWrapper(ctrl.resendCode));
router.post('/login', validate(loginSchema), ctrlWrapper(ctrl.login));
router.post('/google', validate(googleSchema), ctrlWrapper(ctrl.google));
router.post('/logout', ctrlWrapper(ctrl.logout));
router.get('/me', auth, ctrlWrapper(ctrl.getMe));
router.post('/forgot-password', validate(forgotPasswordSchema), ctrlWrapper(ctrl.forgotPassword));
router.post('/reset-password', validate(resetPasswordSchema), ctrlWrapper(ctrl.resetPassword));

export default router;
