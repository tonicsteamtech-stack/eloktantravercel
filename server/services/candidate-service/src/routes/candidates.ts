import { FastifyInstance } from 'fastify';

import { forbidden, internalError } from '@eloktantra/utils';

import { CandidateController } from '../controllers/candidateController';
import { CandidateService } from '../services/candidateService';

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

export default async function candidateRoutes(fastify: FastifyInstance) {
  const candidateService = new CandidateService(fastify);
  const candidateController = new CandidateController(candidateService);

  fastify.get('/', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'string', pattern: '^[0-9]+$' },
          offset: { type: 'string', pattern: '^[0-9]+$' },
        },
      },
    },
  }, candidateController.getAll);

  fastify.get('/search', {
    schema: {
      querystring: {
        type: 'object',
        required: ['q'],
        properties: {
          q: { type: 'string', minLength: 2, maxLength: 120 },
        },
      },
    },
  }, candidateController.search);

  fastify.get('/constituency/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', minLength: 2 },
        },
      },
    },
  }, candidateController.getByConstituency);

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
  }, candidateController.getById);

  fastify.post('/', {
    preHandler: requireAdmin,
    schema: {
      body: {
        type: 'object',
        required: ['name', 'party', 'constituency'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 120 },
          party: { type: 'string', minLength: 2, maxLength: 80 },
          constituency: { type: 'string', minLength: 2, maxLength: 80 },
          education: { type: 'string', maxLength: 200 },
          criminalCases: { type: 'number', minimum: 0 },
          assets: { type: 'number', minimum: 0 },
          liabilities: { type: 'number', minimum: 0 },
        },
      },
    },
  }, candidateController.create);

  fastify.patch('/:id', {
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
          name: { type: 'string', minLength: 2, maxLength: 120 },
          party: { type: 'string', minLength: 2, maxLength: 80 },
          constituency: { type: 'string', minLength: 2, maxLength: 80 },
          education: { type: 'string', maxLength: 200 },
          criminalCases: { type: 'number', minimum: 0 },
          assets: { type: 'number', minimum: 0 },
          liabilities: { type: 'number', minimum: 0 },
        },
      },
    },
  }, candidateController.update);
}
