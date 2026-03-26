const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  aadhaarHash: { type: String },
  constituencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Constituency', required: true },
  isVerified: { type: Boolean, default: false },
  hasVoted: { type: Boolean, default: false },
  votedOffline: { type: Boolean, default: false },
  
  // Security Fingerprints (SESSION LOCK)
  deviceId: { type: String },
  sessionId: { type: String }, 
  lastLoginIP: { type: String },
  faceHash: { type: String },
  tokenHash: { type: String },
  
  suspicious: { type: Boolean, default: false },
  locationStatus: { type: String, default: 'PENDING' },
  
  sessionFaceEmbedding: { type: String },
  dob: { type: Date, required: false }, // Maintain compatibility
  voterId: { type: String, required: false, unique: true } // Maintain compatibility
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
