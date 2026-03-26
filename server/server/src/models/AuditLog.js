const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  event_type: { type: String, required: true },
  detail: { type: String, required: true },
  booth_id: { type: String, default: 'System' },
  ip_hash: { type: String },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
