import { createHash, randomBytes } from 'node:crypto';

import { badRequest } from '@eloktantra/utils';

export class BlockchainLedgerService {
  async recordVote(electionId: string, encryptedVote: string) {
    if (!electionId || !encryptedVote) {
      throw badRequest('electionId and encryptedVote are required');
    }

    const timestamp = new Date().toISOString();
    const entropy = randomBytes(32).toString('hex');
    const txHash = createHash('sha256')
      .update(`${electionId}:${encryptedVote}:${timestamp}:${entropy}`)
      .digest('hex');

    return {
      txHash: `0x${txHash}`,
      timestamp,
    };
  }
}
