import { FastifyReply, FastifyRequest } from 'fastify';

import { ManifestoService } from '../services/manifestoService';

export class ManifestoController {
  constructor(private manifestoService: ManifestoService) {}

  create = async (
    request: FastifyRequest<{
      Body: {
        party: string;
        policy_category: string;
        policy_text: string;
        election_year?: number;
        source_url?: string;
      };
    }>,
    reply: FastifyReply
  ) => {
    const manifesto = await this.manifestoService.createManifesto(request.body);
    return reply.code(201).send({ success: true, manifesto });
  };

  getAll = async (
    request: FastifyRequest<{
      Querystring: { party?: string; category?: string; year?: string; limit?: string; offset?: string };
    }>,
    reply: FastifyReply
  ) => {
    const manifestos = await this.manifestoService.getManifestos({
      party: request.query.party,
      category: request.query.category,
      year: request.query.year ? Number.parseInt(request.query.year, 10) : undefined,
      limit: request.query.limit ? Number.parseInt(request.query.limit, 10) : undefined,
      offset: request.query.offset ? Number.parseInt(request.query.offset, 10) : undefined,
    });

    return reply.send({ success: true, count: manifestos.length, manifestos });
  };

  getById = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const manifesto = await this.manifestoService.getManifestoById(request.params.id);
    return reply.send({ success: true, manifesto });
  };

  compare = async (
    request: FastifyRequest<{ Querystring: { parties?: string; category?: string; year?: string } }>,
    reply: FastifyReply
  ) => {
    const parties = request.query.parties
      ? request.query.parties
          .split(',')
          .map((party) => party.trim())
          .filter(Boolean)
      : undefined;

    const categories = await this.manifestoService.compareManifestos({
      parties,
      category: request.query.category,
      year: request.query.year ? Number.parseInt(request.query.year, 10) : undefined,
    });

    return reply.send({ success: true, count: categories.length, categories });
  };
}
