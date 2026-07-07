import { env } from '../config/env.js';

/**
 * Passed directly to Fastify's `logger` option (Fastify uses pino internally).
 * Pretty printing is dev-only — production emits raw structured JSON, which
 * is what Render's log viewer and any future log aggregator wants to ingest.
 */
export const loggerConfig =
  env.NODE_ENV === 'development'
    ? {
        level: env.LOG_LEVEL,
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' },
        },
      }
    : {
        level: env.LOG_LEVEL,
      };
