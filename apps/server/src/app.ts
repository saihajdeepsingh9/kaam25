import Fastify from 'fastify';
import { loggerConfig } from './lib/logger.js';
import { registerCors } from './plugins/cors.js';
import { registerErrorHandler } from './middleware/error-handler.js';
import { healthRoutes } from './routes/health.js';
import { authRoutes } from './routes/auth.js';

export async function buildApp() {
  const app = Fastify({ logger: loggerConfig, trustProxy: true });

  await registerCors(app);
  registerErrorHandler(app);

  await app.register(healthRoutes);
  await app.register(authRoutes);

  return app;
}
