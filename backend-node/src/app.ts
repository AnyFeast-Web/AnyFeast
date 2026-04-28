import 'reflect-metadata';
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from '@/config';
import { requestId } from '@/middleware/requestId';
import { errorHandler, notFoundHandler } from '@/middleware/errors';
import { authRoutes } from '@/modules/auth/auth.routes';
import { clientsRoutes } from '@/modules/clients/clients.routes';
import { ingredientsRoutes } from '@/modules/ingredients/ingredients.routes';
import { consultationsRoutes } from '@/modules/consultations/consultations.routes';
import { mealPlansRoutes } from '@/modules/mealplans/mealplans.routes';
import { dashboardRoutes } from '@/modules/dashboard/dashboard.routes';
import { messagesRoutes } from '@/modules/messages/messages.routes';
import { webhooksRoutes } from '@/modules/webhooks/webhooks.routes';
import { uploadsRoutes } from '@/modules/uploads/uploads.routes';

export function buildApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(requestId);
  app.use(helmet());
  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        if (config.corsOrigins.includes(origin)) return cb(null, true);
        cb(new Error(`CORS: origin ${origin} not allowed`));
      },
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', env: config.NODE_ENV });
  });

  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/clients', clientsRoutes);
  app.use('/api/v1/ingredients', ingredientsRoutes);
  app.use('/api/v1/consultations', consultationsRoutes);
  app.use('/api/v1/mealplans', mealPlansRoutes);
  app.use('/api/v1/dashboard', dashboardRoutes);
  app.use('/api/v1/messages', messagesRoutes);
  app.use('/api/v1/uploads', uploadsRoutes);
  app.use('/api/v1/webhooks', webhooksRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
