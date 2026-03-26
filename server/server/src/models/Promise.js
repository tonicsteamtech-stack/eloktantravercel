const mongoose = require('mongoose');

const promiseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  electionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },
  status: { type: String, enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'], default: 'PENDING' },
}, { timestamps: true });

module.exports = mongoose.model('Promise', promiseSchema);
