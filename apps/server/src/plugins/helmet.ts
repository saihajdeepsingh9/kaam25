import helmet from '@fastify/helmet';
import type { FastifyInstance } from 'fastify';

export async function registerHelmet(app: FastifyInstance) {
  await app.register(helmet, {
    // This is a pure JSON API with no server-rendered HTML — CSP is
    // primarily an HTML/browser-rendering concern, so the default policy
    // (aimed at pages serving markup/scripts) doesn't apply here and would
    // just add noise. Web's own CSP (via Next.js, if/when we add one) is
    // the right place to control what the *browser* is allowed to load.
    contentSecurityPolicy: false,
  });
}
