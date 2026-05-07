/**
 * FirewallState — Persistent storage untuk firewall tracking
 * Supaya counter tidak reset saat Vercel cold start
 */
const mongoose = require('mongoose');

const firewallStateSchema = new mongoose.Schema({
  ip: { type: String, required: true, unique: true, index: true },
  type: { type: String, enum: ['ddos', 'brute_force', 'blacklist'], required: true },
  count: { type: Number, default: 0 },
  firstRequest: { type: Date, default: Date.now },
  blocked: { type: Boolean, default: false },
  blockUntil: { type: Date, default: null },
  blockReason: { type: String, default: null },
  updatedAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

// Auto-delete expired records setelah 24 jam
firewallStateSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model('FirewallState', firewallStateSchema);
