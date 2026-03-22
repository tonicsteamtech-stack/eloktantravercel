import { FastifyReply, FastifyRequest } from 'fastify';
import { IssueService } from '../services/issueService';

export class IssueController {
  constructor(private issueService: IssueService) {}

  report = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const issue = await this.issueService.reportIssue(request.body);
      return reply.code(201).send({ success: true, issue });
    } catch (error: any) {
      return reply.code(500).send({ success: false, error: error.message });
    }
  };

  getAll = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const issues = await this.issueService.getIssues();
      return reply.send({ success: true, count: issues.length, issues });
    } catch (error: any) {
      return reply.code(500).send({ success: false, error: error.message });
    }
  };

  getByConstituency = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const issues = await this.issueService.getIssuesByConstituency(request.params.id);
      return reply.send({ success: true, count: issues.length, issues });
    } catch (error: any) {
      return reply.code(500).send({ success: false, error: error.message });
    }
  };

  updateStatus = async (request: FastifyRequest<{ Params: { id: string }, Body: { status: string } }>, reply: FastifyReply) => {
    try {
      const issue = await this.issueService.updateIssueStatus(request.params.id, request.body.status);
      return reply.send({ success: true, issue });
    } catch (error: any) {
      return reply.code(500).send({ success: false, error: error.message });
    }
  };
}
