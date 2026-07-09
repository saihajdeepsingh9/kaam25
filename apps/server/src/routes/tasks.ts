import { randomUUID } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import type { ApiResponse, Task } from '@kaam25/types';
import { db } from '../lib/db.js';
import { task } from '../db/schema/index.js';
import { requireWorkspaceMember, requireProjectInWorkspace } from '../lib/workspace-access.js';

const TASK_STATUSES = ['todo', 'in_progress', 'done'] as const;

const createTaskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().trim().max(2000).optional(),
});

const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  status: z.enum(TASK_STATUSES).optional(),
});

interface ProjectParams {
  workspaceId: string;
  projectId: string;
}
interface TaskParams extends ProjectParams {
  taskId: string;
}

function toTaskDto(row: typeof task.$inferSelect): Task {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function taskRoutes(app: FastifyInstance) {
  app.get<{ Params: ProjectParams }>(
    '/api/workspaces/:workspaceId/projects/:projectId/tasks',
    async (request, reply) => {
      const access = await requireWorkspaceMember(request, reply, request.params.workspaceId);
      if (!access) return;
      const validProject = await requireProjectInWorkspace(
        reply,
        request.params.workspaceId,
        request.params.projectId,
      );
      if (!validProject) return;

      const tasks = await db
        .select()
        .from(task)
        .where(eq(task.projectId, request.params.projectId));

      const body: ApiResponse<Task[]> = { success: true, data: tasks.map(toTaskDto) };
      return reply.send(body);
    },
  );

  app.post<{ Params: ProjectParams }>(
    '/api/workspaces/:workspaceId/projects/:projectId/tasks',
    async (request, reply) => {
      const access = await requireWorkspaceMember(request, reply, request.params.workspaceId);
      if (!access) return;
      const validProject = await requireProjectInWorkspace(
        reply,
        request.params.workspaceId,
        request.params.projectId,
      );
      if (!validProject) return;

      const parsed = createTaskSchema.safeParse(request.body);
      if (!parsed.success) {
        const body: ApiResponse<never> = {
          success: false,
          error: { message: parsed.error.errors[0]?.message ?? 'Invalid request' },
        };
        return reply.status(400).send(body);
      }

      const [created] = await db
        .insert(task)
        .values({
          id: randomUUID(),
          projectId: request.params.projectId,
          title: parsed.data.title,
          description: parsed.data.description ?? null,
          createdBy: access.userId,
        })
        .returning();

      const body: ApiResponse<Task> = { success: true, data: toTaskDto(created!) };
      return reply.status(201).send(body);
    },
  );

  app.patch<{ Params: TaskParams }>(
    '/api/workspaces/:workspaceId/projects/:projectId/tasks/:taskId',
    async (request, reply) => {
      const access = await requireWorkspaceMember(request, reply, request.params.workspaceId);
      if (!access) return;
      const validProject = await requireProjectInWorkspace(
        reply,
        request.params.workspaceId,
        request.params.projectId,
      );
      if (!validProject) return;

      const parsed = updateTaskSchema.safeParse(request.body);
      if (!parsed.success) {
        const body: ApiResponse<never> = {
          success: false,
          error: { message: parsed.error.errors[0]?.message ?? 'Invalid request' },
        };
        return reply.status(400).send(body);
      }

      const [updated] = await db
        .update(task)
        .set({ ...parsed.data, updatedAt: new Date() })
        .where(
          and(eq(task.id, request.params.taskId), eq(task.projectId, request.params.projectId)),
        )
        .returning();

      if (!updated) {
        const body: ApiResponse<never> = { success: false, error: { message: 'Task not found' } };
        return reply.status(404).send(body);
      }

      const body: ApiResponse<Task> = { success: true, data: toTaskDto(updated) };
      return reply.send(body);
    },
  );

  app.delete<{ Params: TaskParams }>(
    '/api/workspaces/:workspaceId/projects/:projectId/tasks/:taskId',
    async (request, reply) => {
      const access = await requireWorkspaceMember(request, reply, request.params.workspaceId);
      if (!access) return;
      const validProject = await requireProjectInWorkspace(
        reply,
        request.params.workspaceId,
        request.params.projectId,
      );
      if (!validProject) return;

      await db
        .delete(task)
        .where(
          and(eq(task.id, request.params.taskId), eq(task.projectId, request.params.projectId)),
        );

      return reply.status(204).send();
    },
  );
}
