import { randomBytes } from 'node:crypto';

import { FastifyInstance } from 'fastify';

import { badRequest, conflict, forbidden, notFound } from '@eloktantra/utils';

import '../plugins/supabase';

interface ElectionRecord {
  id: string;
  constituency: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
  start_time: string;
  end_time: string;
}

interface VoterRecord {
  id: string;
  constituency: string;
  is_verified: boolean;
  status: string;
}

export class IdentityService {
  private supabase: FastifyInstance['supabase'];

  constructor(fastify: FastifyInstance) {
    this.supabase = fastify.supabase;
  }

  async verifyVoter(voterId: string): Promise<VoterRecord> {
    if (!voterId) {
      throw badRequest('voterId is required');
    }

    const { data, error } = await this.supabase
      .from('users')
      .select('id, constituency, is_verified, status')
      .eq('id', voterId)
      .single();

    if (error || !data) throw notFound('Voter not found');
    if (!data.is_verified) throw forbidden('Voter is not verified');
    if (data.status !== 'ACTIVE') throw forbidden('Voter account is not active');

    return data as VoterRecord;
  }

  private async getElection(electionId: string): Promise<ElectionRecord> {
    const { data, error } = await this.supabase
      .from('elections')
      .select('id, constituency, status, start_time, end_time')
      .eq('id', electionId)
      .single();

    if (error || !data) {
      throw notFound('Election not found');
    }

    return data as ElectionRecord;
  }

  async generateVotingToken(voterId: string, electionId: string) {
    if (!voterId || !electionId) {
      throw badRequest('voterId and electionId are required');
    }

    const voter = await this.verifyVoter(voterId);
    const election = await this.getElection(electionId);

    if (voter.constituency !== election.constituency) {
      throw forbidden('Voter is not eligible for this constituency election');
    }

    if (election.status !== 'ACTIVE') {
      throw forbidden('Voting tokens can only be generated for active elections');
    }

    const now = new Date();
    const startTime = new Date(election.start_time);
    const endTime = new Date(election.end_time);

    if (now < startTime || now > endTime) {
      throw forbidden('Election is outside active voting window');
    }

    const { data: existingToken, error: tokenLookupError } = await this.supabase
      .from('voting_tokens')
      .select('id, token_hash, used, expires_at')
      .eq('voter_id', voterId)
      .eq('election_id', electionId)
      .maybeSingle();

    if (tokenLookupError) {
      throw badRequest(tokenLookupError.message);
    }

    if (existingToken) {
      if (existingToken.used) {
        throw conflict('A token for this election has already been used by this voter');
      }

      return existingToken;
    }

    const tokenHash = randomBytes(32).toString('hex');

    const { data, error } = await this.supabase
      .from('voting_tokens')
      .insert([
        {
          voter_id: voterId,
          election_id: electionId,
          token_hash: tokenHash,
          used: false,
          expires_at: election.end_time,
        },
      ])
      .select('id, token_hash, used, expires_at')
      .single();

    if (error || !data) throw badRequest(error?.message || 'Unable to create voting token');

    return data;
  }
}
