import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { user } from './auth.js';

/**
 * Tables required by Better Auth's `organization` plugin — our multi-tenancy
 * foundation. "Organization" here is what the product calls a "Workspace";
 * we kept Better Auth's own naming in the schema/API rather than aliasing
 * it, since fighting the library's naming convention buys nothing and costs
 * consistency with its docs. UI copy says "Workspace"; code says
 * "organization" — same pattern as Vercel calling orgs "Teams" in the UI.
 *
 * Managed by Better Auth — see docs/architecture.md before changing shapes.
 */

export const organization = pgTable('organization', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').unique(),
  logo: text('logo'),
  createdAt: timestamp('created_at').notNull(),
  metadata: text('metadata'),
});

export const member = pgTable('member', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  role: text('role').default('member').notNull(),
  createdAt: timestamp('created_at').notNull(),
});

export const invitation = pgTable('invitation', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  role: text('role'),
  status: text('status').default('pending').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  inviterId: text('inviter_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});
