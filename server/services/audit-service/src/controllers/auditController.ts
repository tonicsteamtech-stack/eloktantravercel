import { FastifyReply, FastifyRequest } from 'fastify';

import { AuditService } from '../services/auditService';

export class AuditController {
  constructor(private auditService: AuditService) {}

  getElectionAudit = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const votes = await this.auditService.getElectionAudit(request.params.id);
    return reply.send({ success: true, count: votes.length, auditTrail: votes });
  };

  verifyVote = async (request: FastifyRequest<{ Params: { hash: string } }>, reply: FastifyReply) => {
    const vote = await this.auditService.verifyVoteHash(request.params.hash);
    return reply.send({ success: true, verified: true, voteData: vote });
  };
}
