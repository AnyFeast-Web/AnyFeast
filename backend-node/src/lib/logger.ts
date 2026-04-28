import { createLogger, format, transports } from 'winston';
import { config } from '@/config';

export const logger = createLogger({
  level: config.LOG_LEVEL === 'trace' ? 'silly' : config.LOG_LEVEL,
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    config.isProd ? format.json() : format.combine(format.colorize(), format.simple()),
  ),
  transports: [new transports.Console()],
  silent: config.isTest,
});
