import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import { UnauthorizedError, ForbiddenError } from '@/utils/errors';
import { User } from '@/models/User';

declare global {
  namespace Express {
    interface Request {
      user?: any;
      requestId?: string;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedError('Missing authentication token');
    }

    const decoded = jwt.verify(token, env.JWT_PUBLIC_KEY) as any;
    const user = await User.findById(decoded.userId);

    if (!user || user.status === 'SUSPENDED') {
      throw new UnauthorizedError('User not found or suspended');
    }

    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    };

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return res.status(401).json({
        success: false,
        data: null,
        error: error.message,
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
      });
    }
    next(error);
  }
};

export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.permissions?.includes(permission)) {
      throw new ForbiddenError('Insufficient permissions');
    }
    next();
  };
};

export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }
    next();
  };
};
