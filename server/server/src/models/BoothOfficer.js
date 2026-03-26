const mongoose = require('mongoose');

const boothOfficerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  booth_id: { type: String, required: true },
  device_id: { type: String, required: true },
  status: { type: String, enum: ['Online', 'Offline'], default: 'Offline' },
  is_active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('BoothOfficer', boothOfficerSchema);
