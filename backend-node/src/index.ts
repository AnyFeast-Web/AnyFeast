import 'reflect-metadata';
import { config } from '@/config';
import { logger } from '@/lib/logger';
import { initSentry, Sentry } from '@/lib/sentry';
import { buildApp } from '@/app';
import { connectDb, sequelize } from '@/db/sequelize';
import { closeQueues } from '@/lib/queue';
import { startEmailWorker } from '@/jobs/email.processor';
import { startSmsWorker } from '@/jobs/sms.processor';

async function main() {
  initSentry();
  await connectDb();

  const app = buildApp();
  const emailWorker = startEmailWorker();
  const smsWorker = startSmsWorker();

  const server = app.listen(config.PORT, () => {
    logger.info('server listening', { port: config.PORT, env: config.NODE_ENV });
  });

  const shutdown = async (signal: string) => {
    logger.info('shutting down', { signal });
    server.close();
    await emailWorker.close().catch(() => undefined);
    await smsWorker.close().catch(() => undefined);
    await closeQueues().catch(() => undefined);
    await sequelize.close().catch(() => undefined);
    await Sentry.close(2000).catch(() => undefined);
    process.exit(0);
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

main().catch((err) => {
  logger.error('fatal', { err: (err as Error).message, stack: (err as Error).stack });
  Sentry.captureException(err);
  process.exit(1);
});
