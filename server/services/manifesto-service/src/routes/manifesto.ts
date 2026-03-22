import { FastifyInstance } from 'fastify';

import { ManifestoController } from '../controllers/manifestoController';
import { ManifestoService } from '../services/manifestoService';

export default async function manifestoRoutes(fastify: FastifyInstance) {
  const manifestoService = new ManifestoService(fastify);
  const manifestoController = new ManifestoController(manifestoService);

  fastify.post('/', {
    schema: {
      body: {
        type: 'object',
        required: ['party', 'policy_category', 'policy_text'],
        properties: {
          party: { type: 'string', minLength: 2, maxLength: 120 },
          policy_category: { type: 'string', minLength: 2, maxLength: 120 },
          policy_text: { type: 'string', minLength: 40, maxLength: 20000 },
          election_year: { type: 'number', minimum: 2000, maximum: 2100 },
          source_url: { type: 'string', format: 'uri', maxLength: 500 },
        },
      },
    },
  }, manifestoController.create);

  fastify.get('/', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          party: { type: 'string', minLength: 2 },
          category: { type: 'string', minLength: 2 },
          year: { type: 'string', pattern: '^[0-9]{4}$' },
          limit: { type: 'string', pattern: '^[0-9]+$' },
          offset: { type: 'string', pattern: '^[0-9]+$' },
        },
      },
    },
  }, manifestoController.getAll);

  fastify.get('/compare', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          parties: { type: 'string', minLength: 2 },
          category: { type: 'string', minLength: 2 },
          year: { type: 'string', pattern: '^[0-9]{4}$' },
        },
      },
    },
  }, manifestoController.compare);

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
  }, manifestoController.getById);
}
