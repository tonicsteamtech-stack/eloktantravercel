import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

export class AppError extends Error {
  statusCode: number;
  code: string;
  expose: boolean;
  details?: unknown;

  constructor(statusCode: number, message: string, code = 'APP_ERROR', expose = true, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.expose = expose;
    this.details = details;
  }
}

export function badRequest(message: string, details?: unknown): AppError {
  return new AppError(400, message, 'BAD_REQUEST', true, details);
}

export function unauthorized(message = 'Unauthorized'): AppError {
  return new AppError(401, message, 'UNAUTHORIZED');
}

export function forbidden(message = 'Forbidden'): AppError {
  return new AppError(403, message, 'FORBIDDEN');
}

export function notFound(message = 'Resource not found'): AppError {
  return new AppError(404, message, 'NOT_FOUND');
}

export function conflict(message: string): AppError {
  return new AppError(409, message, 'CONFLICT');
}

export function internalError(message = 'Internal server error', details?: unknown): AppError {
  return new AppError(500, message, 'INTERNAL_ERROR', false, details);
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function corsOriginFromList(origins: string[]): true | string[] {
  if (origins.length === 0 || origins.includes('*')) {
    return true;
  }

  return origins;
}

export function registerSecurityHeaders(fastify: FastifyInstance, enableHsts: boolean): void {
  fastify.addHook('onSend', async (_request, reply, payload) => {
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('X-Frame-Options', 'DENY');
    reply.header('Referrer-Policy', 'no-referrer');
    reply.header('X-Permitted-Cross-Domain-Policies', 'none');
    reply.header('Cross-Origin-Resource-Policy', 'same-site');
    reply.header('Cross-Origin-Opener-Policy', 'same-origin');

    if (enableHsts) {
      reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    return payload;
  });
}

export function registerDefaultErrorHandler(fastify: FastifyInstance, serviceName: string): void {
  fastify.setErrorHandler((error, request, reply) => {
    if (isAppError(error)) {
      request.log.warn(
        {
          err: error,
          code: error.code,
          details: error.details,
        },
        `${serviceName} handled app error`
      );

      reply.code(error.statusCode).send({
        success: false,
        error: error.message,
        code: error.code,
      });
      return;
    }

    const statusCode = error.statusCode && error.statusCode >= 400 ? error.statusCode : 500;

    request.log.error({ err: error }, `${serviceName} unhandled error`);

    reply.code(statusCode).send({
      success: false,
      error: statusCode >= 500 ? 'Internal server error' : error.message,
      code: 'UNHANDLED_ERROR',
    });
  });
}

export function registerGracefulShutdown(fastify: FastifyInstance, serviceName: string, timeoutMs = 10_000): void {
  let shuttingDown = false;

  const shutdown = async (signal: NodeJS.Signals) => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    fastify.log.info({ signal }, `${serviceName} graceful shutdown started`);

    try {
      await Promise.race([
        fastify.close(),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Graceful shutdown timed out')), timeoutMs);
        }),
      ]);

      fastify.log.info(`${serviceName} shutdown complete`);
      process.exit(0);
    } catch (error) {
      fastify.log.error({ err: error }, `${serviceName} shutdown failed`);
      process.exit(1);
    }
  };

  process.once('SIGTERM', () => {
    void shutdown('SIGTERM');
  });

  process.once('SIGINT', () => {
    void shutdown('SIGINT');
  });
}

export async function dependencyHealthCheck(
  endpoint: string,
  timeoutMs = 2000
): Promise<{ ok: boolean; status?: number; latencyMs: number; error?: string }> {
  const start = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(endpoint, { signal: controller.signal });
    return {
      ok: response.ok,
      status: response.status,
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    return {
      ok: false,
      latencyMs: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  } finally {
    clearTimeout(timeout);
  }
}

export function readBearerToken(request: FastifyRequest): string | null {
  const header = request.headers.authorization;
  if (!header) return null;

  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;

  return token;
}

export function ok(reply: FastifyReply, payload: unknown, statusCode = 200): FastifyReply {
  return reply.code(statusCode).send({ success: true, ...((payload as Record<string, unknown>) || {}) });
}
