import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';

import { config } from '@eloktantra/config';
import {
  corsOriginFromList,
  registerDefaultErrorHandler,
  registerGracefulShutdown,
  registerSecurityHeaders,
} from '@eloktantra/utils';

import supabasePlugin from './plugins/supabase';
import auditRoutes from './routes/audit';

dotenv.config();

const SERVICE_NAME = 'audit-service';
const PORT = config.services.audit.port;

const fastify = Fastify({
  logger: { level: config.logLevel },
  requestTimeout: config.requestTimeoutMs,
  trustProxy: true,
});

registerSecurityHeaders(fastify, config.isProduction);
registerDefaultErrorHandler(fastify, SERVICE_NAME);
registerGracefulShutdown(fastify, SERVICE_NAME, config.shutdownTimeoutMs);

fastify.register(cors, {
  origin: corsOriginFromList(config.corsOrigins),
  credentials: true,
});

fastify.register(supabasePlugin);

fastify.get('/health', async () => {
  return {
    success: true,
    status: 'ok',
    service: SERVICE_NAME,
    timestamp: new Date().toISOString(),
  };
});

fastify.register(auditRoutes, { prefix: '/audit' });

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: config.host });
    fastify.log.info(`Audit Service running on http://localhost:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

void start();
