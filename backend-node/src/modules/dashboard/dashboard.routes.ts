import { NextFunction, Request, Response, Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { requireAuth, requireRole } from '@/middleware/auth';

const asyncH =
  <T extends (req: Request, res: Response) => Promise<unknown>>(fn: T) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res)).catch(next);

export const dashboardRoutes = Router();
dashboardRoutes.use(requireAuth, requireRole('nutritionist', 'admin'));

dashboardRoutes.get('/stats', asyncH(dashboardController.stats));
dashboardRoutes.get('/activity', asyncH(dashboardController.activity));
