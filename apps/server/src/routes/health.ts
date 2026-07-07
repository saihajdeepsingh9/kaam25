import type { FastifyInstance } from 'fastify';
import { sql } from 'drizzle-orm';
import type { ApiResponse, HealthStatus } from '@kaam25/types';
import { db } from '../lib/db.js';

const startedAt = Date.now();

export async function healthRoutes(app: FastifyInstance) {
  app.get('/health', async (): Promise<ApiResponse<HealthStatus>> => {
    let dbStatus: HealthStatus['status'] = 'ok';

    try {
      await db.execute(sql`select 1`);
    } catch (err) {
      app.log.error({ err }, 'Health check: database ping failed');
      dbStatus = 'degraded';
    }

    return {
      success: true,
      data: {
        status: dbStatus,
        uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
        timestamp: new Date().toISOString(),
      },
    };
  });
}