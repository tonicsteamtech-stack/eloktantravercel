import { FastifyReply, FastifyRequest } from 'fastify';

import { BlockchainLedgerService } from '../services/blockchainLedgerService';

export class BlockchainLedgerController {
  constructor(private ledgerService: BlockchainLedgerService) {}

  record = async (
    request: FastifyRequest<{ Body: { electionId: string; encryptedVote: string } }>,
    reply: FastifyReply
  ) => {
    const { electionId, encryptedVote } = request.body;
    const result = await this.ledgerService.recordVote(electionId, encryptedVote);

    return reply.send({
      success: true,
      txHash: result.txHash,
      timestamp: result.timestamp,
    });
  };
}
