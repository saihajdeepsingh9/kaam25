import { fromNodeHeaders } from 'better-auth/node';
import { and, eq } from 'drizzle-orm';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { auth } from './auth.js';
import { db } from './db.js';
import { member, project } from '../db/schema/index.js';

/**
 * Verifies the request has a valid session AND that the user is a member
 * of the given workspace. Sends the appropriate 401/403 response and
 * returns null if either check fails — callers should return immediately
 * when they get null back, without sending their own response.
 *
 * Deliberately coarse-grained for now: any member can act on any project in
 * a workspace they belong to, regardless of role (owner/admin/member).
 * Role-based restrictions are a separate, later feature — not forgotten,
 * just sequenced after the data model exists to restrict access to.
 */
export async function requireWorkspaceMember(
  request: FastifyRequest,
  reply: FastifyReply,
  workspaceId: string,
): Promise<{ userId: string } | null> {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
  if (!session) {
    reply.status(401).send({ success: false, error: { message: 'Authentication required' } });
    return null;
  }

  const [membership] = await db
    .select({ role: member.role })
    .from(member)
    .where(and(eq(member.userId, session.user.id), eq(member.organizationId, workspaceId)))
    .limit(1);

  if (!membership) {
    reply.status(403).send({ success: false, error: { message: 'Not a member of this workspace' } });
    return null;
  }

  return { userId: session.user.id };
}

/**
 * Confirms a project both exists and belongs to the given workspace. Call
 * this after requireWorkspaceMember in any route nested under
 * :workspaceId/projects/:projectId/... — without it, a member of Workspace A
 * could pass Workspace A's ID (passing the membership check) but supply a
 * projectId belonging to Workspace B and operate on it anyway.
 */
export async function requireProjectInWorkspace(
  reply: FastifyReply,
  workspaceId: string,
  projectId: string,
): Promise<boolean> {
  const [row] = await db
    .select({ id: project.id })
    .from(project)
    .where(and(eq(project.id, projectId), eq(project.workspaceId, workspaceId)))
    .limit(1);

  if (!row) {
    reply.status(404).send({ success: false, error: { message: 'Project not found' } });
    return false;
  }

  return true;
}
