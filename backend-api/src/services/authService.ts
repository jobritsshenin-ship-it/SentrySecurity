import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';
import { User, IUser } from '@/models/User';
import { AuditLog } from '@/models/AuditLog';
import redisClient from '@/config/redis';
import { env } from '@/config/env';
import { UnauthorizedError, ConflictError, ValidationError } from '@/utils/errors';
import { logger } from '@/utils/logger';

export class AuthService {
  async register(email: string, password: string, firstName: string, lastName: string) {
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'ANALYST',
      status: 'ACTIVE',
      permissions: this.getPermissionsForRole('ANALYST'),
    });

    await user.save();

    return {
      userId: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  async login(email: string, password: string, ip: string) {
    // Check rate limiting
    const loginAttempts = await redisClient.incr(`login_attempts:${email}`);
    if (loginAttempts > 5) {
      throw new UnauthorizedError('Too many login attempts. Account locked for 15 minutes.');
    }
    if (loginAttempts === 1) {
      await redisClient.expire(`login_attempts:${email}`, 15 * 60);
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password)) {
      // Log failed attempt
      const auditLog = new AuditLog({
        userId: user?._id || null,
        action: 'LOGIN',
        resource: 'USER',
        details: 'Failed login attempt',
        ip,
        status: 'FAILURE',
        retentionExpiry: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000),
      });
      await auditLog.save();

      throw new UnauthorizedError('Invalid credentials');
    }

    // Clear login attempts
    await redisClient.del(`login_attempts:${email}`);

    // Check MFA
    if (user.mfaEnabled) {
      return { mfaRequired: true, userId: user._id };
    }

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user._id);

    // Update last login
    user.lastLogin = new Date();
    user.loginHistory = user.loginHistory || [];
    user.loginHistory.push({
      timestamp: new Date(),
      ip,
      device: 'Web',
      status: 'SUCCESS',
    });
    if (user.loginHistory.length > 10) {
      user.loginHistory = user.loginHistory.slice(-10);
    }
    await user.save();

    // Log successful login
    const auditLog = new AuditLog({
      userId: user._id,
      action: 'LOGIN',
      resource: 'USER',
      details: 'Successful login',
      ip,
      status: 'SUCCESS',
      retentionExpiry: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000),
    });
    await auditLog.save();

    return {
      accessToken,
      refreshToken,
      expiresIn: env.JWT_EXPIRATION,
      user: {
        userId: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        permissions: user.permissions,
      },
    };
  }

  async verifyMFA(userId: string, otp: string) {
    const user = await User.findById(userId);
    if (!user || !user.mfaEnabled || !user.mfaSecret) {
      throw new UnauthorizedError('MFA not enabled');
    }

    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: otp,
      window: 1,
    });

    if (!verified) {
      throw new UnauthorizedError('Invalid OTP');
    }

    const { accessToken, refreshToken } = await this.generateTokens(user._id);

    return {
      accessToken,
      refreshToken,
      expiresIn: env.JWT_EXPIRATION,
    };
  }

  async refreshToken(token: string) {
    try {
      const decoded = jwt.verify(token, env.JWT_PUBLIC_KEY) as any;
      const user = await User.findById(decoded.userId);

      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      const { accessToken } = await this.generateTokens(user._id);
      return { accessToken, expiresIn: env.JWT_EXPIRATION };
    } catch (error) {
      throw new UnauthorizedError('Invalid token');
    }
  }

  private async generateTokens(userId: string) {
    const accessToken = jwt.sign({ userId }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRATION,
      algorithm: 'HS256',
    });

    const refreshToken = jwt.sign({ userId }, env.JWT_SECRET, {
      expiresIn: env.REFRESH_TOKEN_EXPIRATION,
      algorithm: 'HS256',
    });

    // Store refresh token in Redis
    await redisClient.setEx(`refresh_token:${userId}`, env.REFRESH_TOKEN_EXPIRATION, refreshToken);

    return { accessToken, refreshToken };
  }

  private getPermissionsForRole(role: string): string[] {
    const permissions: Record<string, string[]> = {
      ADMIN: [
        'view_dashboard',
        'view_transactions',
        'flag_transactions',
        'view_alerts',
        'resolve_alerts',
        'manage_users',
        'manage_settings',
      ],
      ANALYST: ['view_dashboard', 'view_transactions', 'flag_transactions', 'view_alerts', 'resolve_alerts'],
      MANAGER: ['view_dashboard', 'view_alerts'],
      AUDITOR: ['view_dashboard'],
      READONLY: ['view_dashboard'],
    };

    return permissions[role] || [];
  }
}

export const authService = new AuthService();
