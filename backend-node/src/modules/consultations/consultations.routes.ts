import { NextFunction, Request, Response, Router } from 'express';
import { consultationsController } from './consultations.controller';
import { requireAuth, requireRole } from '@/middleware/auth';
import { writeLimiter } from '@/middleware/rateLimit';

const asyncH =
  <T extends (req: Request, res: Response) => Promise<unknown>>(fn: T) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res)).catch(next);

export const consultationsRoutes = Router();
consultationsRoutes.use(requireAuth, requireRole('nutritionist', 'admin'));

consultationsRoutes.get('/', asyncH(consultationsController.list));
consultationsRoutes.get('/:id', asyncH(consultationsController.get));
consultationsRoutes.post('/', writeLimiter, asyncH(consultationsController.create));
consultationsRoutes.patch('/:id', writeLimiter, asyncH(consultationsController.update));
consultationsRoutes.delete('/:id', writeLimiter, asyncH(consultationsController.remove));
