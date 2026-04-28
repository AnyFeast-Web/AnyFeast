import { NextFunction, Request, Response, Router } from 'express';
import { ingredientsController } from './ingredients.controller';
import { requireAuth, requireRole } from '@/middleware/auth';
import { writeLimiter } from '@/middleware/rateLimit';

const asyncH =
  <T extends (req: Request, res: Response) => Promise<unknown>>(fn: T) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res)).catch(next);

export const ingredientsRoutes = Router();
ingredientsRoutes.use(requireAuth, requireRole('nutritionist', 'admin'));

ingredientsRoutes.get('/', asyncH(ingredientsController.list));
ingredientsRoutes.get('/:id', asyncH(ingredientsController.get));
ingredientsRoutes.post('/', writeLimiter, asyncH(ingredientsController.create));
ingredientsRoutes.patch('/:id', writeLimiter, asyncH(ingredientsController.update));
ingredientsRoutes.delete('/:id', writeLimiter, asyncH(ingredientsController.remove));
