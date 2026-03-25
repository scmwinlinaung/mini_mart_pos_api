import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import validate from '../middleware/validation.middleware';
import * as authController from '../controllers/auth.controller';
import * as authValidator from '../validators/auth.validator';

const router = Router();

// Public routes
router.post('/login', validate(authValidator.loginSchema), authController.login);

// Protected routes
router.post('/refresh', validate(authValidator.refreshTokenSchema), authController.refreshToken);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);
router.post('/change-password', authenticate, validate(authValidator.changePasswordSchema), authController.changePassword);

export default router;
