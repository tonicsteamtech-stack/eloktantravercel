import { FastifyInstance } from 'fastify';

import { badRequest, notFound } from '@eloktantra/utils';

import '../plugins/supabase';

interface ManifestoInput {
  party: string;
  policy_category: string;
  policy_text: string;
  election_year?: number;
  source_url?: string;
}

const normalizeText = (text: string): string => text.replace(/\s+/g, ' ').trim();

const generateSummary = (policyText: string): string => {
  const normalized = normalizeText(policyText);
  if (normalized.length <= 280) return normalized;

  const sentences = normalized.split(/(?<=[.!?])\s+/).filter(Boolean);
  const brief = sentences.slice(0, 2).join(' ');
  return brief.length > 320 ? `${brief.slice(0, 317)}...` : brief;
};

const generateComparisonInsight = (summaries: Array<{ party: string; summary: string }>): string => {
  if (summaries.length <= 1) {
    return 'Only one party manifesto is available for this category.';
  }

  const parties = summaries.map((entry) => entry.party).join(', ');
  return `Comparison generated across ${summaries.length} parties: ${parties}.`;
};

export class ManifestoService {
  private supabase: FastifyInstance['supabase'];

  constructor(fastify: FastifyInstance) {
    this.supabase = fastify.supabase;
  }

  async createManifesto(payload: ManifestoInput) {
    if (!payload.party || !payload.policy_category || !payload.policy_text) {
      throw badRequest('party, policy_category and policy_text are required');
    }

    const policyText = normalizeText(payload.policy_text);
    if (policyText.length < 40) {
      throw badRequest('policy_text must be at least 40 characters for useful summarization');
    }

    const summary = generateSummary(policyText);

    const { data, error } = await this.supabase
      .from('manifestos')
      .insert([
        {
          party: payload.party,
          policy_category: payload.policy_category,
          policy_text: policyText,
          summary,
          election_year: payload.election_year || null,
          source_url: payload.source_url || null,
        },
      ])
      .select('*')
      .single();

    if (error || !data) {
      throw badRequest(error?.message || 'Unable to create manifesto');
    }

    return data;
  }

  async getManifestos(filters: { party?: string; category?: string; year?: number; limit?: number; offset?: number }) {
    const limit = filters.limit ?? 100;
    const offset = filters.offset ?? 0;

    let query = this.supabase
      .from('manifestos')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (filters.party) query = query.eq('party', filters.party);
    if (filters.category) query = query.eq('policy_category', filters.category);
    if (filters.year) query = query.eq('election_year', filters.year);

    const { data, error } = await query;

    if (error) {
      throw badRequest(error.message);
    }

    return data || [];
  }

  async getManifestoById(id: string) {
    const { data, error } = await this.supabase.from('manifestos').select('*').eq('id', id).single();

    if (error || !data) {
      throw notFound('Manifesto not found');
    }

    return data;
  }

  async compareManifestos(filters: { parties?: string[]; category?: string; year?: number }) {
    let query = this.supabase
      .from('manifestos')
      .select('id, party, policy_category, summary, policy_text, election_year, created_at')
      .order('policy_category', { ascending: true })
      .order('party', { ascending: true });

    if (filters.category) query = query.eq('policy_category', filters.category);
    if (filters.year) query = query.eq('election_year', filters.year);
    if (filters.parties && filters.parties.length > 0) query = query.in('party', filters.parties);

    const { data, error } = await query;

    if (error) {
      throw badRequest(error.message);
    }

    const rows = data || [];
    const grouped = new Map<string, Array<{ manifesto_id: string; party: string; summary: string; policy_text: string }>>();

    for (const row of rows) {
      const key = row.policy_category;
      const collection = grouped.get(key) || [];
      collection.push({
        manifesto_id: row.id,
        party: row.party,
        summary: row.summary,
        policy_text: row.policy_text,
      });
      grouped.set(key, collection);
    }

    return Array.from(grouped.entries()).map(([category, entries]) => ({
      category,
      insight: generateComparisonInsight(entries.map((entry) => ({ party: entry.party, summary: entry.summary }))),
      manifestos: entries,
    }));
  }
}
