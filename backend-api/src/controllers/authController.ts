import { Request, Response } from 'express';
import { authService } from '@/services/authService';
import { asyncHandler } from '@/middleware/errorHandler';
import { AuditLog } from '@/models/AuditLog';
import { ValidationError } from '@/utils/errors';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body;

  if (!email || !password || !firstName || !lastName) {
    throw new ValidationError('Missing required fields');
  }

  const user = await authService.register(email, password, firstName, lastName);

  res.status(201).json({
    success: true,
    data: user,
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const ip = req.ip || '0.0.0.0';

  if (!email || !password) {
    throw new ValidationError('Email and password required');
  }

  const result = await authService.login(email, password, ip);

  res.json({
    success: true,
    data: result,
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
  });
});

export const verifyMFA = asyncHandler(async (req: Request, res: Response) => {
  const { otp } = req.body;
  const userId = (req as any).tempUserId;

  if (!otp || !userId) {
    throw new ValidationError('OTP and userId required');
  }

  const result = await authService.verifyMFA(userId, otp);

  res.json({
    success: true,
    data: result,
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new ValidationError('Refresh token required');
  }

  const result = await authService.refreshToken(refreshToken);

  res.json({
    success: true,
    data: result,
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (userId) {
    const auditLog = new AuditLog({
      userId,
      action: 'LOGOUT',
      resource: 'USER',
      details: 'User logout',
      ip: req.ip || '0.0.0.0',
      status: 'SUCCESS',
      retentionExpiry: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000),
    });
    await auditLog.save();
  }

  res.json({
    success: true,
    message: 'Logged out successfully',
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
  });
});
