const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true
  },
  electionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Election',
    required: true
  },
  constituencyId: {
    type: String,
    required: true
  },
  blockchainHash: {
    type: String,
    unique: true,
    sparse: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Ensure a user can only vote once per election
voteSchema.index({ userId: 1, electionId: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);
