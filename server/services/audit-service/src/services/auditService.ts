import { FastifyInstance } from 'fastify';

import { badRequest, notFound } from '@eloktantra/utils';

import '../plugins/supabase';

export class AuditService {
  private supabase: FastifyInstance['supabase'];

  constructor(fastify: FastifyInstance) {
    this.supabase = fastify.supabase;
  }

  async getElectionAudit(electionId: string) {
    if (!electionId) {
      throw badRequest('Election id is required');
    }

    const { data, error } = await this.supabase
      .from('votes')
      .select('id, election_id, token_id, blockchain_tx_hash, timestamp')
      .eq('election_id', electionId)
      .order('timestamp', { ascending: false });

    if (error) throw badRequest(error.message);
    return data || [];
  }

  async verifyVoteHash(txHash: string) {
    if (!txHash) {
      throw badRequest('Transaction hash is required');
    }

    const { data, error } = await this.supabase
      .from('votes')
      .select('id, election_id, token_id, blockchain_tx_hash, timestamp')
      .eq('blockchain_tx_hash', txHash)
      .single();

    if (error || !data) throw notFound('Vote transaction not found in ledger');
    return data;
  }
}
