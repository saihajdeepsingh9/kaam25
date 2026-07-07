import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../config/env.js';
import * as schema from '../db/schema/index.js';

const isLocalDb = /localhost|127\.0\.0\.1/.test(env.DATABASE_URL);

const queryClient = postgres(env.DATABASE_URL, {
  max: 10,
  ssl: isLocalDb ? false : 'require',
  prepare: isLocalDb,
});

export const db = drizzle(queryClient, { schema });