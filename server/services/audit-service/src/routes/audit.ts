import { FastifyInstance } from 'fastify';

import { AuditController } from '../controllers/auditController';
import { AuditService } from '../services/auditService';

export default async function auditRoutes(fastify: FastifyInstance) {
  const auditService = new AuditService(fastify);
  const auditController = new AuditController(auditService);

  fastify.get('/election/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', minLength: 3 },
        },
      },
    },
  }, auditController.getElectionAudit);

  fastify.get('/vote/:hash', {
    schema: {
      params: {
        type: 'object',
        required: ['hash'],
        properties: {
          hash: { type: 'string', minLength: 10 },
        },
      },
    },
  }, auditController.verifyVote);
}
