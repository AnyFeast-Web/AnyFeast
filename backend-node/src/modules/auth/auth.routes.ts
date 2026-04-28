import { Router } from 'express';
import { authController } from './auth.controller';
import { requireAuth } from '@/middleware/auth';
import { authLimiter } from '@/middleware/rateLimit';

const asyncH =
  <T extends (req: import('express').Request, res: import('express').Response) => Promise<unknown>>(fn: T) =>
  (req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) =>
    Promise.resolve(fn(req, res)).catch(next);

export const authRoutes = Router();

authRoutes.post('/register', authLimiter, asyncH(authController.register));
authRoutes.post('/login', authLimiter, asyncH(authController.login));
authRoutes.post('/refresh', authLimiter, asyncH(authController.refresh));
authRoutes.post('/logout', asyncH(authController.logout));
authRoutes.get('/me', requireAuth, asyncH(authController.me));
authRoutes.post('/forgot-password', authLimiter, asyncH(authController.forgotPassword));
authRoutes.post('/reset-password', authLimiter, asyncH(authController.resetPassword));
authRoutes.post('/change-password', requireAuth, asyncH(authController.changePassword));
