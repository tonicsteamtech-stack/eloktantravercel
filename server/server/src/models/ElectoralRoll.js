const mongoose = require('mongoose');

const ElectoralRollSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  voterId: { type: String, required: true, unique: true },
  aadhaarHash: { type: String, required: true },
  address: { type: String, required: true },
  electionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Election' },
  constituencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Constituency', required: true },
  faceEmbedding: { type: String, required: true },
  solToken: { type: String, required: true, unique: true },
  solTokenUsed: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('ElectoralRoll', ElectoralRollSchema);
