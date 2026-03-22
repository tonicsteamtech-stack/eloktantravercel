const mongoose = require('mongoose');

const VotingTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  used: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, expires: '2h' } // Token expires after 2 hours
});

module.exports = mongoose.model('VotingToken', VotingTokenSchema);
