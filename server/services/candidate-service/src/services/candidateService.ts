import { FastifyInstance } from 'fastify';

import { badRequest, notFound } from '@eloktantra/utils';

import '../plugins/supabase';

interface CandidateRecord {
  id?: string;
  name: string;
  party: string;
  constituency: string;
  education?: string | null;
  criminalCases?: number;
  assets?: number;
  liabilities?: number;
}

export class CandidateService {
  private supabase: FastifyInstance['supabase'];

  constructor(fastify: FastifyInstance) {
    this.supabase = fastify.supabase;
  }

  async getAllCandidates(limit = 50, offset = 0) {
    const { data, error } = await this.supabase
      .from('candidates')
      .select('*')
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw badRequest(error.message);
    return data || [];
  }

  async getCandidateById(id: string) {
    if (!id) {
      throw badRequest('Candidate id is required');
    }

    const { data, error } = await this.supabase.from('candidates').select('*').eq('id', id).single();

    if (error || !data) throw notFound('Candidate not found');
    return data;
  }

  async getCandidatesByConstituency(constituencyId: string) {
    if (!constituencyId) {
      throw badRequest('Constituency is required');
    }

    const { data, error } = await this.supabase
      .from('candidates')
      .select('*')
      .eq('constituency', constituencyId)
      .order('name', { ascending: true });

    if (error) throw badRequest(error.message);
    return data || [];
  }

  async createCandidate(candidateData: CandidateRecord) {
    if (!candidateData?.name || !candidateData?.party || !candidateData?.constituency) {
      throw badRequest('name, party and constituency are required');
    }

    const payload = {
      ...candidateData,
      criminalCases: candidateData.criminalCases ?? 0,
      assets: candidateData.assets ?? 0,
      liabilities: candidateData.liabilities ?? 0,
    };

    const { data, error } = await this.supabase.from('candidates').insert([payload]).select().single();

    if (error) throw badRequest(error.message);
    return data;
  }

  async updateCandidate(id: string, candidateData: Partial<CandidateRecord>) {
    if (!id) {
      throw badRequest('Candidate id is required');
    }

    if (!candidateData || Object.keys(candidateData).length === 0) {
      throw badRequest('At least one field is required for update');
    }

    const { data, error } = await this.supabase
      .from('candidates')
      .update(candidateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) throw notFound('Candidate not found');
    return data;
  }

  async searchCandidates(query: string) {
    const cleanQuery = query.replace(/[^\w\s-]/g, '').trim();
    if (!cleanQuery) {
      throw badRequest('Search query is required');
    }

    const pattern = `%${cleanQuery}%`;

    const { data, error } = await this.supabase
      .from('candidates')
      .select('*')
      .or(`name.ilike.${pattern},party.ilike.${pattern},constituency.ilike.${pattern}`)
      .order('name', { ascending: true });

    if (error) throw badRequest(error.message);
    return data || [];
  }
}
