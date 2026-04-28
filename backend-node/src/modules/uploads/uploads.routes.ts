import { NextFunction, Request, Response, Router } from 'express';
import { uploadsController } from './uploads.controller';
import { requireAuth, requireRole } from '@/middleware/auth';
import { writeLimiter } from '@/middleware/rateLimit';

const asyncH =
  <T extends (req: Request, res: Response) => Promise<unknown>>(fn: T) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res)).catch(next);

export const uploadsRoutes = Router();
uploadsRoutes.use(requireAuth, requireRole('nutritionist', 'admin'));

uploadsRoutes.post('/sign-url', writeLimiter, asyncH(uploadsController.signUrl));
