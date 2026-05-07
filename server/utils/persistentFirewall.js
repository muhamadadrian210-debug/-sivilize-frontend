/**
 * Persistent Firewall Tracker
 * Menyimpan state firewall ke MongoDB supaya tidak reset saat Vercel cold start
 * Fallback ke in-memory kalau MongoDB tidak tersedia
 */

const mongoose = require('mongoose');

// In-memory fallback
const memoryStore = new Map();

function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

/**
 * Get firewall record untuk IP tertentu
 */
async function getRecord(ip, type) {
  if (!isMongoConnected()) {
    return memoryStore.get(`${type}:${ip}`) || null;
  }

  try {
    const FirewallState = require('../models/FirewallState');
    return await FirewallState.findOne({ ip, type }).lean();
  } catch {
    return memoryStore.get(`${type}:${ip}`) || null;
  }
}

/**
 * Save/update firewall record
 */
async function saveRecord(ip, type, data) {
  // Selalu update memory store sebagai cache
  memoryStore.set(`${type}:${ip}`, { ...data, ip, type });

  if (!isMongoConnected()) return;

  try {
    const FirewallState = require('../models/FirewallState');
    await FirewallState.findOneAndUpdate(
      { ip, type },
      { ...data, ip, type, updatedAt: new Date() },
      { upsert: true, new: true }
    );
  } catch (err) {
    // Silently fail — memory store sudah diupdate
    console.warn(`⚠️ Persistent firewall save failed for ${ip}: ${err.message}`);
  }
}

/**
 * Delete firewall record (saat blokir berakhir)
 */
async function deleteRecord(ip, type) {
  memoryStore.delete(`${type}:${ip}`);

  if (!isMongoConnected()) return;

  try {
    const FirewallState = require('../models/FirewallState');
    await FirewallState.deleteOne({ ip, type });
  } catch {}
}

/**
 * Check apakah IP diblokir (cek semua type)
 */
async function isBlocked(ip) {
  const now = Date.now();

  for (const type of ['ddos', 'brute_force', 'blacklist']) {
    const record = await getRecord(ip, type);
    if (!record) continue;

    if (record.blocked) {
      if (!record.blockUntil) return { blocked: true, reason: type, waitMs: null };

      const blockUntil = new Date(record.blockUntil).getTime();
      if (now < blockUntil) {
        return { blocked: true, reason: type, waitMs: blockUntil - now };
      } else {
        // Blokir sudah berakhir, hapus
        await deleteRecord(ip, type);
      }
    }
  }

  return { blocked: false };
}

/**
 * Tambah count untuk IP (DDoS tracking)
 */
async function incrementDDoS(ip) {
  const now = Date.now();
  let record = await getRecord(ip, 'ddos') || {
    count: 0,
    aggressiveCount: 0,
    firstRequest: now,
    aggressiveFirstRequest: now,
    blocked: false,
    blockUntil: null,
  };

  // Reset window 1 menit
  if (now - new Date(record.firstRequest).getTime() > 60 * 1000) {
    record.count = 0;
    record.firstRequest = now;
  }

  // Reset aggressive window 5 detik
  if (now - new Date(record.aggressiveFirstRequest || now).getTime() > 5 * 1000) {
    record.aggressiveCount = 0;
    record.aggressiveFirstRequest = now;
  }

  record.count = (record.count || 0) + 1;
  record.aggressiveCount = (record.aggressiveCount || 0) + 1;

  await saveRecord(ip, 'ddos', record);
  return record;
}

/**
 * Block IP
 */
async function blockIP(ip, type, durationMs, reason) {
  const blockUntil = durationMs ? new Date(Date.now() + durationMs) : null;
  await saveRecord(ip, type, {
    blocked: true,
    blockUntil,
    blockReason: reason,
    count: 0,
    firstRequest: new Date(),
  });
}

/**
 * Tambah brute force attempt
 */
async function incrementBruteForce(ip) {
  const now = Date.now();
  let record = await getRecord(ip, 'brute_force') || {
    count: 0,
    firstAttempt: now,
    blocked: false,
    blockUntil: null,
  };

  // Reset window 15 menit
  if (now - new Date(record.firstAttempt || now).getTime() > 15 * 60 * 1000) {
    record.count = 0;
    record.firstAttempt = now;
    record.blocked = false;
    record.blockUntil = null;
  }

  record.count = (record.count || 0) + 1;
  await saveRecord(ip, 'brute_force', record);
  return record;
}

module.exports = {
  getRecord,
  saveRecord,
  deleteRecord,
  isBlocked,
  incrementDDoS,
  incrementBruteForce,
  blockIP,
};
