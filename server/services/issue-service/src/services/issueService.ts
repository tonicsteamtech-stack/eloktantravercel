import { FastifyInstance } from 'fastify';
import '../plugins/supabase';

export class IssueService {
  private supabase: FastifyInstance['supabase'];

  constructor(fastify: FastifyInstance) {
    this.supabase = fastify.supabase;
  }

  async reportIssue(issueData: any) {
    const { data, error } = await this.supabase
      .from('issues')
      .insert([issueData])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async getIssues() {
    const { data, error } = await this.supabase
      .from('issues')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async getIssuesByConstituency(constituency: string) {
    // In our simplified schema, location might be the constituency or coords
    const { data, error } = await this.supabase
      .from('issues')
      .select('*')
      .ilike('location', `%${constituency}%`);

    if (error) throw new Error(error.message);
    return data;
  }

  async updateIssueStatus(id: string, status: string) {
    const { data, error } = await this.supabase
      .from('issues')
      .update({ status, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}
