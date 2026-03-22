import { FastifyInstance } from 'fastify';

import { badRequest, notFound } from '@eloktantra/utils';

import '../plugins/supabase';

interface PromiseInput {
  candidate_id: string;
  title: string;
  description: string;
  target_date?: string;
  status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  progress_percentage?: number;
  constituency?: string;
  source_url?: string;
}

interface PromiseProgressUpdate {
  status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  progress_percentage?: number;
  update_note?: string;
  evidence_url?: string;
}

export class PromiseService {
  private supabase: FastifyInstance['supabase'];

  constructor(fastify: FastifyInstance) {
    this.supabase = fastify.supabase;
  }

  private normalizeProgress(status: PromiseInput['status'], progress?: number): number {
    const normalized = progress ?? 0;
    if (normalized < 0 || normalized > 100) {
      throw badRequest('progress_percentage must be between 0 and 100');
    }

    if (status === 'COMPLETED') return 100;
    if (status === 'NOT_STARTED') return 0;
    return normalized;
  }

  async addPromise(payload: PromiseInput) {
    if (!payload.candidate_id || !payload.title || !payload.description) {
      throw badRequest('candidate_id, title, and description are required');
    }

    const status = payload.status || 'NOT_STARTED';
    const progress = this.normalizeProgress(status, payload.progress_percentage);

    const { data, error } = await this.supabase
      .from('promises')
      .insert([
        {
          candidate_id: payload.candidate_id,
          title: payload.title,
          description: payload.description,
          constituency: payload.constituency || null,
          target_date: payload.target_date || null,
          source_url: payload.source_url || null,
          status,
          progress_percentage: progress,
        },
      ])
      .select('*, candidates(name, party)')
      .single();

    if (error || !data) {
      throw badRequest(error?.message || 'Unable to create promise');
    }

    return data;
  }

  async getAllPromises(filters: {
    candidateId?: string;
    status?: string;
    constituency?: string;
    limit?: number;
    offset?: number;
  }) {
    const limit = filters.limit ?? 100;
    const offset = filters.offset ?? 0;

    let query = this.supabase
      .from('promises')
      .select('*, candidates(name, party, constituency)')
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (filters.candidateId) query = query.eq('candidate_id', filters.candidateId);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.constituency) query = query.eq('constituency', filters.constituency);

    const { data, error } = await query;

    if (error) {
      throw badRequest(error.message);
    }

    return data || [];
  }

  async getPromiseById(id: string) {
    const { data, error } = await this.supabase
      .from('promises')
      .select('*, candidates(name, party, constituency)')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw notFound('Promise not found');
    }

    return data;
  }

  async getPromisesByCandidate(candidateId: string) {
    const { data, error } = await this.supabase
      .from('promises')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('updated_at', { ascending: false });

    if (error) throw badRequest(error.message);
    return data || [];
  }

  async updatePromiseProgress(id: string, update: PromiseProgressUpdate) {
    if (Object.keys(update).length === 0) {
      throw badRequest('At least one field is required for update');
    }

    const existing = await this.getPromiseById(id);
    const status = update.status || existing.status;
    const progress = this.normalizeProgress(status as PromiseInput['status'], update.progress_percentage ?? existing.progress_percentage);

    const { data, error } = await this.supabase
      .from('promises')
      .update({
        status,
        progress_percentage: progress,
        update_note: update.update_note || existing.update_note,
        evidence_url: update.evidence_url || existing.evidence_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*, candidates(name, party, constituency)')
      .single();

    if (error || !data) {
      throw badRequest(error?.message || 'Unable to update promise progress');
    }

    return data;
  }
}
