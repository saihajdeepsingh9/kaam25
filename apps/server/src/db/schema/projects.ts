import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { organization } from './organization.js';
import { user } from './auth.js';

/**
 * A project belongs to exactly one workspace. Tasks (next feature pass)
 * will belong to a project, giving the full hierarchy:
 * workspace -> project -> task.
 */
export const project = pgTable('project', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  createdBy: text('created_by')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
