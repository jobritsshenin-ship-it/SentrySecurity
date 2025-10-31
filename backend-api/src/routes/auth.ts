import { Router } from 'express';
import * as authController from '@/controllers/authController';
import { authMiddleware } from '@/middleware/auth';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/mfa/verify', authController.verifyMFA);
router.post('/refresh', authController.refresh);
router.post('/logout', authMiddleware, authController.logout);

export default router;
