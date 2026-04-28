import { NextFunction, Request, Response, Router } from 'express';
import { messagesController } from './messages.controller';
import { requireAuth, requireRole } from '@/middleware/auth';
import { writeLimiter } from '@/middleware/rateLimit';

const asyncH =
  <T extends (req: Request, res: Response) => Promise<unknown>>(fn: T) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res)).catch(next);

export const messagesRoutes = Router();
messagesRoutes.use(requireAuth, requireRole('nutritionist', 'admin'));

messagesRoutes.get('/', asyncH(messagesController.list));
messagesRoutes.post('/', writeLimiter, asyncH(messagesController.send));
messagesRoutes.post('/mark-read', writeLimiter, asyncH(messagesController.markRead));
