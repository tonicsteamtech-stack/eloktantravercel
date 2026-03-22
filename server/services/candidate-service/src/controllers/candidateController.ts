import { FastifyReply, FastifyRequest } from 'fastify';

import { CandidateService } from '../services/candidateService';

export class CandidateController {
  constructor(private candidateService: CandidateService) {}

  getAll = async (
    request: FastifyRequest<{ Querystring: { limit?: string; offset?: string } }>,
    reply: FastifyReply
  ) => {
    const limit = Number.parseInt(request.query.limit || '50', 10);
    const offset = Number.parseInt(request.query.offset || '0', 10);

    const candidates = await this.candidateService.getAllCandidates(limit, offset);
    return reply.send({ success: true, count: candidates.length, candidates });
  };

  getById = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const candidate = await this.candidateService.getCandidateById(request.params.id);
    return reply.send({ success: true, candidate });
  };

  getByConstituency = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const candidates = await this.candidateService.getCandidatesByConstituency(request.params.id);
    return reply.send({ success: true, count: candidates.length, candidates });
  };

  create = async (request: FastifyRequest, reply: FastifyReply) => {
    const candidate = await this.candidateService.createCandidate(request.body as never);
    return reply.code(201).send({ success: true, candidate });
  };

  update = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const candidate = await this.candidateService.updateCandidate(request.params.id, request.body as never);
    return reply.send({ success: true, candidate });
  };

  search = async (request: FastifyRequest<{ Querystring: { q: string } }>, reply: FastifyReply) => {
    const { q } = request.query;
    const candidates = await this.candidateService.searchCandidates(q);
    return reply.send({ success: true, count: candidates.length, candidates });
  };
}
