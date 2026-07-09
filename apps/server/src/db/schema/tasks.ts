import { pgTable, pgEnum, text, timestamp } from 'drizzle-orm/pg-core';
import { project } from './projects.js';
import { user } from './auth.js';

export const taskStatusEnum = pgEnum('task_status', ['todo', 'in_progress', 'done']);

export const task = pgTable('task', {
  id: text('id').primaryKey(),
  projectId: text('project_id')
    .notNull()
    .references(() => project.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  status: taskStatusEnum('status').default('todo').notNull(),
  createdBy: text('created_by')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
