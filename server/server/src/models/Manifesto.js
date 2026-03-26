const mongoose = require('mongoose');

const manifestoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  electionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },
  constituencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Constituency', required: true },
  priorities: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Manifesto', manifestoSchema);
