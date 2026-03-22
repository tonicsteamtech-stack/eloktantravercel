import { FastifyInstance } from 'fastify';

import { forbidden, internalError } from '@eloktantra/utils';

import { PromiseController } from '../controllers/promiseController';
import { PromiseService } from '../services/promiseService';

async function requireAdmin(request: { headers: Record<string, string | string[] | undefined> }) {
  const adminApiKey = process.env.ADMIN_API_KEY;
  if (!adminApiKey) {
    throw internalError('ADMIN_API_KEY is not configured');
  }

  const candidateKey = request.headers['x-admin-key'];
  if (candidateKey !== adminApiKey) {
    throw forbidden('Admin access required');
  }
}

export default async function promiseRoutes(fastify: FastifyInstance) {
  const promiseService = new PromiseService(fastify);
  const promiseController = new PromiseController(promiseService);

  fastify.post('/', {
    preHandler: requireAdmin,
    schema: {
      body: {
        type: 'object',
        required: ['candidate_id', 'title', 'description'],
        properties: {
          candidate_id: { type: 'string', minLength: 3 },
          title: { type: 'string', minLength: 3, maxLength: 240 },
          description: { type: 'string', minLength: 10, maxLength: 5000 },
          target_date: { type: 'string', format: 'date' },
          status: { type: 'string', enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED'] },
          progress_percentage: { type: 'number', minimum: 0, maximum: 100 },
          constituency: { type: 'string', minLength: 2, maxLength: 80 },
          source_url: { type: 'string', format: 'uri', maxLength: 500 },
        },
      },
    },
  }, promiseController.add);

  fastify.get('/', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          candidate_id: { type: 'string', minLength: 3 },
          status: { type: 'string', enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED'] },
          constituency: { type: 'string', minLength: 2, maxLength: 80 },
          limit: { type: 'string', pattern: '^[0-9]+$' },
          offset: { type: 'string', pattern: '^[0-9]+$' },
        },
      },
    },
  }, promiseController.getAll);

  fastify.get('/candidate/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', minLength: 3 },
        },
      },
    },
  }, promiseController.getByCandidate);

  fastify.get('/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', minLength: 3 },
        },
      },
    },
  }, promiseController.getById);

  fastify.patch('/:id/progress', {
    preHandler: requireAdmin,
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', minLength: 3 },
        },
      },
      body: {
        type: 'object',
        minProperties: 1,
        properties: {
          status: { type: 'string', enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED'] },
          progress_percentage: { type: 'number', minimum: 0, maximum: 100 },
          update_note: { type: 'string', minLength: 3, maxLength: 5000 },
          evidence_url: { type: 'string', format: 'uri', maxLength: 500 },
        },
      },
    },
  }, promiseController.updateProgress);
}
