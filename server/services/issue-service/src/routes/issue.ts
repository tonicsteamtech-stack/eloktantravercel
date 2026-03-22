import { FastifyInstance } from 'fastify';
import { IssueService } from '../services/issueService';
import { IssueController } from '../controllers/issueController';

export default async function issueRoutes(fastify: FastifyInstance) {
  const issueService = new IssueService(fastify);
  const issueController = new IssueController(issueService);

  fastify.post('/', issueController.report);
  fastify.get('/', issueController.getAll);
  fastify.get('/constituency/:id', issueController.getByConstituency);
  fastify.patch('/:id', issueController.updateStatus);
}
