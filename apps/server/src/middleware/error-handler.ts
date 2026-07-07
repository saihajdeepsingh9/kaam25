import type { FastifyInstance, FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import type { ApiResponse } from '@kaam25/types';

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    request.log.error(error);

    const statusCode = error.statusCode ?? 500;
    const isServerError = statusCode >= 500;

    const body: ApiResponse<never> = {
      success: false,
      error: {
        // Never leak internal error details for 500s — log them, but keep the
        // client-facing message generic.
        message: isServerError ? 'Internal server error' : error.message,
        code: error.code,
      },
    };

    reply.status(statusCode).send(body);
  });

  app.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
    const body: ApiResponse<never> = {
      success: false,
      error: { message: `Route not found: ${request.method} ${request.url}` },
    };
    reply.status(404).send(body);
  });
}
