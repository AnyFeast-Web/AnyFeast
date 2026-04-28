import { NextFunction, Request, Response, Router } from 'express';
import { mealPlansController } from './mealplans.controller';
import { requireAuth, requireRole } from '@/middleware/auth';
import { writeLimiter } from '@/middleware/rateLimit';

const asyncH =
  <T extends (req: Request, res: Response) => Promise<unknown>>(fn: T) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res)).catch(next);

export const mealPlansRoutes = Router();
mealPlansRoutes.use(requireAuth, requireRole('nutritionist', 'admin'));

mealPlansRoutes.get('/', asyncH(mealPlansController.list));
mealPlansRoutes.get('/:id', asyncH(mealPlansController.get));
mealPlansRoutes.post('/', writeLimiter, asyncH(mealPlansController.create));
mealPlansRoutes.patch('/:id', writeLimiter, asyncH(mealPlansController.update));
mealPlansRoutes.delete('/:id', writeLimiter, asyncH(mealPlansController.remove));
mealPlansRoutes.post('/generate', writeLimiter, asyncH(mealPlansController.generate));
mealPlansRoutes.post('/:id/email', writeLimiter, asyncH(mealPlansController.sendEmail));
