import { randomUUID } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import type { ApiResponse, Task, TaskWithProject } from '@kaam25/types';
import { db } from '../lib/db.js';
import { task, project } from '../db/schema/index.js';
import { requireWorkspaceMember, requireProjectAccess } from '../lib/workspace-access.js';

const TASK_STATUSES = ['todo', 'in_progress', 'done'] as const;
const TASK_PRIORITIES = ['low', 'medium', 'high'] as const;

const createTaskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().trim().max(2000).optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  // z.coerce.date() handles both a plain date ("2026-07-20", from a native
  // <input type="date">) and a full ISO datetime. Optional here (no due
  // date at all is valid) — quick-add should stay quick, not require this.
  dueDate: z.coerce.date().optional(),
});

const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  // .nullable() short-circuits on an explicit `null` before coercion runs,
  // so clearing a due date (null) is distinct from omitting the field
  // entirely (leave unchanged) — coerce.date() never sees the null.
  dueDate: z.coerce.date().nullable().optional(),
});

interface WorkspaceParams {
  workspaceId: string;
}
interface ProjectParams extends WorkspaceParams {
  projectId: string;
}
interface TaskParams extends ProjectParams {
  taskId: string;
}

function toTaskDto(row: typeof task.$inferSelect): Task {
  return {
    ...row,
    dueDate: row.dueDate ? row.dueDate.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function taskRoutes(app: FastifyInstance) {
  // Flattened, cross-project view — every task in the workspace, with its
  // project name attached. This is what the desktop widget shows: "what do
  // I need to do," not "which project has which tasks." Only requires
  // workspace membership, not a specific project — it deliberately spans
  // all of them.
  app.get<{ Params: WorkspaceParams }>(
    '/api/workspaces/:workspaceId/tasks',
    async (request, reply) => {
      const access = await requireWorkspaceMember(request, reply, request.params.workspaceId);
      if (!access) return;

      const rows = await db
        .select({ task, projectName: project.name })
        .from(task)
        .innerJoin(project, eq(task.projectId, project.id))
        .where(eq(project.workspaceId, request.params.workspaceId));

      const tasks: TaskWithProject[] = rows.map((row) => ({
        ...toTaskDto(row.task),
        projectName: row.projectName,
      }));

      const body: ApiResponse<TaskWithProject[]> = { success: true, data: tasks };
      return reply.send(body);
    },
  );


  app.get<{ Params: ProjectParams }>(
    '/api/workspaces/:workspaceId/projects/:projectId/tasks',
    async (request, reply) => {
      const access = await requireProjectAccess(
        request,
        reply,
        request.params.workspaceId,
        request.params.projectId,
      );
      if (!access) return;

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
      const access = await requireProjectAccess(
        request,
        reply,
        request.params.workspaceId,
        request.params.projectId,
      );
      if (!access) return;

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
          priority: parsed.data.priority ?? 'medium',
          dueDate: parsed.data.dueDate ?? null,
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
      const access = await requireProjectAccess(
        request,
        reply,
        request.params.workspaceId,
        request.params.projectId,
      );
      if (!access) return;

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
      const access = await requireProjectAccess(
        request,
        reply,
        request.params.workspaceId,
        request.params.projectId,
      );
      if (!access) return;

      await db
        .delete(task)
        .where(
          and(eq(task.id, request.params.taskId), eq(task.projectId, request.params.projectId)),
        );

      return reply.status(204).send();
    },
  );
}
