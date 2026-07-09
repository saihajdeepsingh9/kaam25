import Fastify from 'fastify';
import { loggerConfig } from './lib/logger.js';
import { registerCors } from './plugins/cors.js';
import { registerHelmet } from './plugins/helmet.js';
import { registerErrorHandler } from './middleware/error-handler.js';
import { healthRoutes } from './routes/health.js';
import { authRoutes } from './routes/auth.js';
import { projectRoutes } from './routes/projects.js';
import { taskRoutes } from './routes/tasks.js';

export async function buildApp() {
  const app = Fastify({ logger: loggerConfig, trustProxy: true });

  await registerHelmet(app);
  await registerCors(app);
  registerErrorHandler(app);

  await app.register(healthRoutes);
  await app.register(authRoutes);
  await app.register(projectRoutes);
  await app.register(taskRoutes);

  return app;
}
