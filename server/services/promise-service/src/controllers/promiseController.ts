import { FastifyReply, FastifyRequest } from 'fastify';

import { PromiseService } from '../services/promiseService';

export class PromiseController {
  constructor(private promiseService: PromiseService) {}

  add = async (
    request: FastifyRequest<{
      Body: {
        candidate_id: string;
        title: string;
        description: string;
        target_date?: string;
        status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
        progress_percentage?: number;
        constituency?: string;
        source_url?: string;
      };
    }>,
    reply: FastifyReply
  ) => {
    const promise = await this.promiseService.addPromise(request.body);
    return reply.code(201).send({ success: true, promise });
  };

  getAll = async (
    request: FastifyRequest<{
      Querystring: {
        candidate_id?: string;
        status?: string;
        constituency?: string;
        limit?: string;
        offset?: string;
      };
    }>,
    reply: FastifyReply
  ) => {
    const promises = await this.promiseService.getAllPromises({
      candidateId: request.query.candidate_id,
      status: request.query.status,
      constituency: request.query.constituency,
      limit: request.query.limit ? Number.parseInt(request.query.limit, 10) : undefined,
      offset: request.query.offset ? Number.parseInt(request.query.offset, 10) : undefined,
    });

    return reply.send({ success: true, count: promises.length, promises });
  };

  getById = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const promise = await this.promiseService.getPromiseById(request.params.id);
    return reply.send({ success: true, promise });
  };

  getByCandidate = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const promises = await this.promiseService.getPromisesByCandidate(request.params.id);
    return reply.send({ success: true, count: promises.length, promises });
  };

  updateProgress = async (
    request: FastifyRequest<{
      Params: { id: string };
      Body: {
        status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
        progress_percentage?: number;
        update_note?: string;
        evidence_url?: string;
      };
    }>,
    reply: FastifyReply
  ) => {
    const promise = await this.promiseService.updatePromiseProgress(request.params.id, request.body);
    return reply.send({ success: true, promise });
  };
}
