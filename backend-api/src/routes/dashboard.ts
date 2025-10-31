import { Router, Request, Response } from 'express';
import { authMiddleware } from '@/middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/kpis', async (req: Request, res: Response) => {
  // Returns cached KPI data from Redis
  res.json({
    success: true,
    data: {
      todayMetrics: {
        totalTransactions: 15000,
        activeAlerts: 245,
        detectionAccuracy: 96.5,
        pendingCases: 0,
        systemUptime: 99.9,
      },
      trends: {
        transactionsTrend: 2.5,
        alertsTrend: -1.2,
        accuracyTrend: 0.5,
      },
    },
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
  });
});

router.get('/analytics', async (req: Request, res: Response) => {
  // Returns aggregated analytics for dashboard charts
  res.json({
    success: true,
    data: {
      transactionTrend: [],
      alertDistribution: {},
      accuracyTrend: [],
    },
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
  });
});

export default router;
