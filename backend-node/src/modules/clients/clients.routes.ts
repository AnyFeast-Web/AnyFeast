import { NextFunction, Request, Response, Router } from 'express';
import { clientsController } from './clients.controller';
import { requireAuth, requireRole } from '@/middleware/auth';
import { writeLimiter } from '@/middleware/rateLimit';

const asyncH =
  <T extends (req: Request, res: Response) => Promise<unknown>>(fn: T) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res)).catch(next);

export const clientsRoutes = Router();

clientsRoutes.use(requireAuth, requireRole('nutritionist', 'admin'));

clientsRoutes.get('/', asyncH(clientsController.list));
clientsRoutes.get('/:id', asyncH(clientsController.get));
clientsRoutes.post('/', writeLimiter, asyncH(clientsController.create));
clientsRoutes.patch('/:id', writeLimiter, asyncH(clientsController.update));
clientsRoutes.delete('/:id', writeLimiter, asyncH(clientsController.remove));
clientsRoutes.post('/:id/measurements', writeLimiter, asyncH(clientsController.addMeasurement));
