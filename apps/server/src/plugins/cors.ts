import cors from '@fastify/cors';
import type { FastifyInstance } from 'fastify';
import { corsOrigins } from '../config/env.js';

export async function registerCors(app: FastifyInstance) {
  await app.register(cors, {
    origin: corsOrigins,
    credentials: true,
  });
}
