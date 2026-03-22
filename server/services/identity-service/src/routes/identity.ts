import { FastifyInstance } from 'fastify';

import { IdentityController } from '../controllers/identityController';
import { IdentityService } from '../services/identityService';

export default async function identityRoutes(fastify: FastifyInstance) {
  const identityService = new IdentityService(fastify);
  const identityController = new IdentityController(identityService);

  fastify.post('/verify-voter', {
    schema: {
      body: {
        type: 'object',
        required: ['voterId'],
        properties: {
          voterId: { type: 'string', minLength: 3 },
        },
      },
    },
  }, identityController.verify);

  fastify.post('/generate-voting-token', {
    schema: {
      body: {
        type: 'object',
        required: ['voterId', 'electionId'],
        properties: {
          voterId: { type: 'string', minLength: 3 },
          electionId: { type: 'string', minLength: 3 },
        },
      },
    },
  }, identityController.generateToken);
}
