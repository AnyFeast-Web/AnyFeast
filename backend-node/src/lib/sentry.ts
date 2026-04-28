import * as Sentry from '@sentry/node';
import { config } from '@/config';

let initialized = false;

export function initSentry(): void {
  if (initialized || !config.SENTRY_DSN) return;
  Sentry.init({
    dsn: config.SENTRY_DSN,
    environment: config.SENTRY_ENVIRONMENT,
    tracesSampleRate: config.isProd ? 0.1 : 1.0,
  });
  initialized = true;
}

export { Sentry };
