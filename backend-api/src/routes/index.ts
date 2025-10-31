import { Router } from 'express';
import authRoutes from './auth';
import transactionRoutes from './transactions';
import alertRoutes from './alerts';
import dashboardRoutes from './dashboard';

const router = Router();

router.use('/auth', authRoutes);
router.use('/transactions', transactionRoutes);
router.use('/alerts', alertRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
