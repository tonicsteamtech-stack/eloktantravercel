const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  voterId: { type: String, required: true, unique: true },
  dob: { type: Date, required: true },
  hasVoted: { type: Boolean, default: false },
  deviceId: { type: String, required: false }, // Store it on first login
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
