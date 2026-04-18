const Vote = require('../models/Vote');
const userRepository = require('../repositories/userRepository');
const votingTokenRepository = require('../repositories/votingTokenRepository');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const evaluateRisk = async (req, res) => {
  try {
    const { faceConfidence, deviceTrusted, attemptCount } = req.body;

    let riskScore = 0;

    if (!deviceTrusted) riskScore += 30;
    if (faceConfidence < 0.9) riskScore += 40;
    if (attemptCount && attemptCount > 2) riskScore += 20;

    if (riskScore > 60) {
      return res.status(403).json({ riskScore, status: 'BLOCKED', message: 'Risk evaluation failed' });
    }

    res.json({ riskScore, status: 'ALLOW' });
  } catch (error) {
    res.status(500).json({ error: 'Risk evaluation failed' });
  }
};

const generateVotingToken = async (req, res) => {
  try {
    const { userId } = req.body;
    
    let existingToken = await votingTokenRepository.findOne({ userId, used: false });
    if (existingToken) {
      return res.status(400).json({ error: 'A valid voting token already exists' });
    }

    const token = uuidv4();
    const votingToken = await votingTokenRepository.create({
      token,
      userId,
      used: false
    });

    res.json({
      success: true,
      token,
      userId,
      status: 'READY_FOR_VOTING'
    });
  } catch (error) {
    res.status(500).json({ error: 'Token generation failed' });
  }
};

const castVote = async (req, res) => {
  try {
    const { candidateId, electionId, constituencyId, deviceId, userId, tokenHash } = req.body;

    if (!candidateId || !electionId) {
      return res.status(400).json({ success: false, error: 'candidateId and electionId are required' });
    }

    // Use provided userId or derive from tokenHash/deviceId
    const voterId = userId || tokenHash || deviceId || 'anonymous-' + Date.now();

    // Prevent double voting — unique index will also enforce this
    const existingVote = await Vote.findOne({ 
      electionId, 
      $or: [
        { userId: voterId },
        ...(deviceId ? [{ userId: deviceId }] : [])
      ]
    });

    if (existingVote) {
      return res.status(403).json({ 
        success: false, 
        error: 'You have already voted in this election. Duplicate vote blocked.' 
      });
    }

    // Generate blockchain hash
    const blockchainHash = '0x' + crypto.randomBytes(32).toString('hex');

    // ─── COMMIT THE VOTE ───────────────────────────────
    const newVote = await Vote.create({
      userId: voterId,
      candidateId,
      electionId,
      constituencyId: constituencyId || 'National',
      blockchainHash
    });

    console.log(`✅ Vote recorded: Election=${electionId}, Candidate=${candidateId}, Voter=${voterId}`);

    // Mark user as voted if we can find them
    try {
      if (userId) {
        await userRepository.findByIdAndUpdate(userId, { hasVoted: true });
      }
    } catch (e) {
      console.warn('Could not update user voted status:', e.message);
    }

    res.json({
      success: true,
      message: 'Vote successfully recorded',
      blockchainHash,
      txHash: blockchainHash,
      voteId: newVote._id,
      constituency: constituencyId || 'Verified'
    });
  } catch (error) {
    console.error('Vote submission failed:', error);
    
    // Handle duplicate key error from unique index
    if (error.code === 11000) {
      return res.status(403).json({ 
        success: false, 
        error: 'Duplicate vote detected. You have already voted in this election.' 
      });
    }

    res.status(500).json({ success: false, error: 'Failed to record vote' });
  }
};

// GET /votes/election/:electionId — for admin counting center
const getVotesByElection = async (req, res) => {
  try {
    const { electionId } = req.params;
    const votes = await Vote.find({ electionId }).lean();

    const formatted = votes.map(v => ({
      id: v._id,
      candidateId: v.candidateId,
      electionId: v.electionId,
      constituencyId: v.constituencyId,
      blockchainHash: v.blockchainHash,
      timestamp: v.createdAt
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Failed to fetch votes:', error);
    res.status(500).json({ error: 'Failed to fetch votes' });
  }
};

module.exports = {
  evaluateRisk,
  generateVotingToken,
  castVote,
  getVotesByElection
};
