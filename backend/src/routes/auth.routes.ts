import { Router } from 'express';
import { login, getMe, changePassword, loginSchema, changePasswordSchema } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

router.post('/login', validate(loginSchema), login);
router.get('/me', authenticate, getMe);
router.post('/change-password', authenticate, validate(changePasswordSchema), changePassword);

export default router;

