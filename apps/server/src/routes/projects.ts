import { randomUUID } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import type { ApiResponse, Project } from '@kaam25/types';
import { db } from '../lib/db.js';
import { project } from '../db/schema/index.js';
import { requireWorkspaceMember } from '../lib/workspace-access.js';

const createProjectSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  description: z.string().trim().max(2000).optional(),
});

interface WorkspaceParams {
  workspaceId: string;
}
interface ProjectParams extends WorkspaceParams {
  projectId: string;
}

/** Drizzle returns Date objects for timestamp columns; the API contract
 * (see @kaam25/types) declares them as ISO strings — the actual shape after
 * JSON serialization. This makes that conversion explicit rather than
 * relying on JSON.stringify's implicit Date handling to paper over it. */
function toProjectDto(row: typeof project.$inferSelect): Project {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function projectRoutes(app: FastifyInstance) {
  app.get<{ Params: WorkspaceParams }>(
    '/api/workspaces/:workspaceId/projects',
    async (request, reply) => {
      const access = await requireWorkspaceMember(request, reply, request.params.workspaceId);
      if (!access) return;

      const projects = await db
        .select()
        .from(project)
        .where(eq(project.workspaceId, request.params.workspaceId));

      const body: ApiResponse<Project[]> = { success: true, data: projects.map(toProjectDto) };
      return reply.send(body);
    },
  );

  app.post<{ Params: WorkspaceParams }>(
    '/api/workspaces/:workspaceId/projects',
    async (request, reply) => {
      const access = await requireWorkspaceMember(request, reply, request.params.workspaceId);
      if (!access) return;

      const parsed = createProjectSchema.safeParse(request.body);
      if (!parsed.success) {
        const body: ApiResponse<never> = {
          success: false,
          error: { message: parsed.error.errors[0]?.message ?? 'Invalid request' },
        };
        return reply.status(400).send(body);
      }

      const [created] = await db
        .insert(project)
        .values({
          id: randomUUID(),
          workspaceId: request.params.workspaceId,
          name: parsed.data.name,
          description: parsed.data.description ?? null,
          createdBy: access.userId,
        })
        .returning();

      const body: ApiResponse<Project> = { success: true, data: toProjectDto(created!) };
      return reply.status(201).send(body);
    },
  );

  app.get<{ Params: ProjectParams }>(
    '/api/workspaces/:workspaceId/projects/:projectId',
    async (request, reply) => {
      const access = await requireWorkspaceMember(request, reply, request.params.workspaceId);
      if (!access) return;

      const [found] = await db
        .select()
        .from(project)
        .where(
          and(
            eq(project.id, request.params.projectId),
            eq(project.workspaceId, request.params.workspaceId),
          ),
        )
        .limit(1);

      if (!found) {
        const body: ApiResponse<never> = {
          success: false,
          error: { message: 'Project not found' },
        };
        return reply.status(404).send(body);
      }

      const body: ApiResponse<Project> = { success: true, data: toProjectDto(found) };
      return reply.send(body);
    },
  );

  app.delete<{ Params: ProjectParams }>(
    '/api/workspaces/:workspaceId/projects/:projectId',
    async (request, reply) => {
      const access = await requireWorkspaceMember(request, reply, request.params.workspaceId);
      if (!access) return;

      await db
        .delete(project)
        .where(
          and(
            eq(project.id, request.params.projectId),
            eq(project.workspaceId, request.params.workspaceId),
          ),
        );

      return reply.status(204).send();
    },
  );
}
