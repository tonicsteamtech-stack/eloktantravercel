import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';

import { config } from '@eloktantra/config';
import {
  badRequest,
  corsOriginFromList,
  registerDefaultErrorHandler,
  registerGracefulShutdown,
  registerSecurityHeaders,
} from '@eloktantra/utils';

import supabasePlugin from './plugins/supabase';

dotenv.config();

const SERVICE_NAME = 'issue-service';
const PORT = config.services.issueReporting.port;

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

fastify.get('/issues', {
  schema: {
    querystring: {
      type: 'object',
      properties: {
        constituency: { type: 'string', minLength: 2, maxLength: 80 },
        status: { type: 'string', enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED'] },
        limit: { type: 'string', pattern: '^[0-9]+$' },
        offset: { type: 'string', pattern: '^[0-9]+$' },
      },
    },
  },
}, async (request) => {
  const { constituency, status, limit = '50', offset = '0' } = request.query as {
    constituency?: string;
    status?: string;
    limit?: string;
    offset?: string;
  };

  let query = fastify.supabase.from('issues').select('*').order('created_at', { ascending: false });

  if (constituency) {
    query = query.eq('constituency', constituency);
  }

  if (status) {
    query = query.eq('status', status);
  }

  const parsedLimit = Number.parseInt(limit, 10);
  const parsedOffset = Number.parseInt(offset, 10);

  query = query.range(parsedOffset, parsedOffset + parsedLimit - 1);

  const { data, error } = await query;
  if (error) {
    throw badRequest(error.message);
  }

  return { success: true, count: data?.length || 0, issues: data || [] };
});

fastify.post('/issues', {
  schema: {
    body: {
      type: 'object',
      required: ['location', 'constituency', 'issue_type', 'description', 'reported_by_uuid'],
      properties: {
        location: { type: 'string', minLength: 2, maxLength: 180 },
        constituency: { type: 'string', minLength: 2, maxLength: 80 },
        issue_type: { type: 'string', minLength: 2, maxLength: 80 },
        description: { type: 'string', minLength: 10, maxLength: 4000 },
        reported_by_uuid: { type: 'string', minLength: 3 },
      },
    },
  },
}, async (request, reply) => {
  const issue = request.body as {
    location: string;
    constituency: string;
    issue_type: string;
    description: string;
    reported_by_uuid: string;
  };

  const { data, error } = await fastify.supabase
    .from('issues')
    .insert([
      {
        ...issue,
        status: 'OPEN',
      },
    ])
    .select()
    .single();

  if (error || !data) {
    throw badRequest(error?.message || 'Unable to create issue report');
  }

  return reply.code(201).send({
    success: true,
    message: 'Issue reported successfully',
    issue: data,
  });
});

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: config.host });
    fastify.log.info(`Issue Service running on http://localhost:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

void start();
