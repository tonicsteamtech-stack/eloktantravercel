import { FastifyReply, FastifyRequest } from 'fastify';

import { IdentityService } from '../services/identityService';

export class IdentityController {
  constructor(private identityService: IdentityService) {}

  verify = async (request: FastifyRequest<{ Body: { voterId: string } }>, reply: FastifyReply) => {
    const { voterId } = request.body;
    const voter = await this.identityService.verifyVoter(voterId);
    return reply.send({ success: true, voter });
  };

  generateToken = async (
    request: FastifyRequest<{ Body: { voterId: string; electionId: string } }>,
    reply: FastifyReply
  ) => {
    const { voterId, electionId } = request.body;
    const token = await this.identityService.generateVotingToken(voterId, electionId);
    return reply.send({
      success: true,
      tokenHash: token.token_hash,
      expiresAt: token.expires_at,
    });
  };
}
