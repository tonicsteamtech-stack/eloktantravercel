import { FastifyInstance } from 'fastify';

import { BlockchainLedgerController } from '../controllers/blockchainLedgerController';
import { BlockchainLedgerService } from '../services/blockchainLedgerService';

export default async function ledgerRoutes(fastify: FastifyInstance) {
  const ledgerService = new BlockchainLedgerService();
  const ledgerController = new BlockchainLedgerController(ledgerService);

  fastify.post('/record-vote', {
    schema: {
      body: {
        type: 'object',
        required: ['electionId', 'encryptedVote'],
        properties: {
          electionId: { type: 'string', minLength: 3 },
          encryptedVote: { type: 'string', minLength: 16, maxLength: 10_000 },
        },
      },
    },
  }, ledgerController.record);
}
