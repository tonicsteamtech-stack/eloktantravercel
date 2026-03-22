const votingTokenRepository = require('../repositories/votingTokenRepository');
const { v4: uuidv4 } = require('uuid');

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
    
    // One token per user (Using repository for robustness)
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

module.exports = {
  evaluateRisk,
  generateVotingToken
};
