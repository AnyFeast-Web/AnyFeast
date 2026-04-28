import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { logger } from '@/lib/logger';
import { Sentry } from '@/lib/sentry';

export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export const badRequest = (code: string, message: string, details?: unknown) =>
  new HttpError(400, code, message, details);
export const unauthorized = (code = 'UNAUTHORIZED', message = 'Unauthorized') =>
  new HttpError(401, code, message);
export const forbidden = (code = 'FORBIDDEN', message = 'Forbidden') =>
  new HttpError(403, code, message);
export const notFound = (code = 'NOT_FOUND', message = 'Not found') =>
  new HttpError(404, code, message);
export const conflict = (code: string, message: string) => new HttpError(409, code, message);

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: err.flatten(),
      },
    });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.status).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
    return;
  }

  const e = err as Error;
  logger.error('unhandled error', { message: e.message, stack: e.stack, requestId: req.id });
  Sentry.captureException(e);

  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Internal server error', requestId: req.id },
  });
}
