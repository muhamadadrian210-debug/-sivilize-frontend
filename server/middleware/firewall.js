/**
 * SIVILIZE HUB PRO — Advanced Firewall Middleware
 * Proteksi berlapis terhadap DDoS, Brute Force, dan serangan berat
 */

// ── Storage untuk tracking ───────────────────────────────────
const ipRequestCount = new Map();   // { ip: { count, firstRequest, blocked, blockUntil } }
const ipBlacklist = new Set();      // IP yang diblokir permanen sesi ini
const suspiciousIPs = new Map();    // IP dengan aktivitas mencurigakan
const connectionCount = new Map();  // Koneksi aktif per IP

// ── Konfigurasi ──────────────────────────────────────────────
const CONFIG = {
  // DDoS Protection
  DDOS_MAX_REQUESTS: 200,          // Max request per window
  DDOS_WINDOW_MS: 60 * 1000,       // Window 1 menit
  DDOS_BLOCK_DURATION_MS: 30 * 60 * 1000, // Blokir 30 menit

  // Brute Force Protection
  BRUTE_MAX_ATTEMPTS: 5,           // Max percobaan gagal
  BRUTE_WINDOW_MS: 15 * 60 * 1000, // Window 15 menit
  BRUTE_BLOCK_DURATION_MS: 60 * 60 * 1000, // Blokir 1 jam

  // Aggressive DDoS (request sangat cepat)
  AGGRESSIVE_THRESHOLD: 100,       // Dilonggarkan dari 50 ke 100 agar user sah tidak terblokir
  AGGRESSIVE_WINDOW_MS: 5 * 1000,  // Window 5 detik
  AGGRESSIVE_BLOCK_DURATION_MS: 2 * 60 * 60 * 1000, // Blokir dikurangi dari 24 jam ke 2 jam agar tidak terlalu fatal

  // Concurrent connection limit
  MAX_CONCURRENT: 20,              // Max 20 koneksi bersamaan per IP

  // Suspicious patterns
  MAX_404_PER_MINUTE: 10,          // Max 10 request 404 per menit
  MAX_ERROR_PER_MINUTE: 15,        // Max 15 error per menit
};

// ── Helper: Get real IP ──────────────────────────────────────
function getRealIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         req.connection?.remoteAddress ||
         req.ip ||
         'unknown';
}

// ── Helper: Format waktu tunggu ──────────────────────────────
function formatWaitTime(ms) {
  const minutes = Math.ceil(ms / 60000);
  if (minutes < 60) return `${minutes} menit`;
  const hours = Math.ceil(minutes / 60);
  return `${hours} jam`;
}

// ── Cleanup expired records setiap 5 menit ───────────────────
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of ipRequestCount.entries()) {
    if (data.blockUntil && now > data.blockUntil) {
      ipRequestCount.delete(ip);
    } else if (!data.blockUntil && now - data.firstRequest > CONFIG.DDOS_WINDOW_MS * 2) {
      ipRequestCount.delete(ip);
    }
  }
  for (const [ip, data] of suspiciousIPs.entries()) {
    if (now - data.firstSeen > 60 * 60 * 1000) {
      suspiciousIPs.delete(ip);
    }
  }
}, 5 * 60 * 1000);

// ── 1. DDoS Protection Middleware ───────────────────────────
exports.ddosProtection = (req, res, next) => {
  const ip = getRealIP(req);
  const now = Date.now();

  // Cek blacklist permanen
  if (ipBlacklist.has(ip)) {
    return res.status(429).json({
      success: false,
      message: 'Akses ditolak secara permanen.',
      code: 'BLACKLISTED'
    });
  }

  const record = ipRequestCount.get(ip) || {
    count: 0,
    aggressiveCount: 0,
    firstRequest: now,
    aggressiveFirstRequest: now,
    blocked: false,
    blockUntil: null,
    blockReason: null,
  };

  // Cek apakah masih diblokir
  if (record.blocked && record.blockUntil) {
    if (now < record.blockUntil) {
      const waitMs = record.blockUntil - now;
      return res.status(429).json({
        success: false,
        message: `Terlalu banyak request. Coba lagi dalam ${formatWaitTime(waitMs)}.`,
        code: 'RATE_LIMITED',
        retryAfter: Math.ceil(waitMs / 1000),
      });
    } else {
      // Blokir sudah berakhir, reset
      record.blocked = false;
      record.blockUntil = null;
      record.count = 0;
      record.aggressiveCount = 0;
      record.firstRequest = now;
      record.aggressiveFirstRequest = now;
    }
  }

  // Reset window jika sudah lewat
  if (now - record.firstRequest > CONFIG.DDOS_WINDOW_MS) {
    record.count = 0;
    record.firstRequest = now;
  }
  if (now - record.aggressiveFirstRequest > CONFIG.AGGRESSIVE_WINDOW_MS) {
    record.aggressiveCount = 0;
    record.aggressiveFirstRequest = now;
  }

  record.count++;
  record.aggressiveCount++;

  // Cek DDoS agresif (banyak request dalam waktu sangat singkat)
  if (record.aggressiveCount > CONFIG.AGGRESSIVE_THRESHOLD) {
    record.blocked = true;
    record.blockUntil = now + CONFIG.AGGRESSIVE_BLOCK_DURATION_MS;
    record.blockReason = 'aggressive_ddos';
    ipRequestCount.set(ip, record);

    console.warn(`🚨 AGGRESSIVE DDOS DETECTED: ${ip} — ${record.aggressiveCount} req in 5s — BLOCKED 24h`);

    // Alert ke admin
    try {
      const { sendSecurityAlert } = require('../utils/alertService');
      sendSecurityAlert('brute_force', {
        ip,
        endpoint: req.path,
        method: req.method,
        userAgent: req.headers['user-agent'],
        attempts: record.aggressiveCount,
      });
    } catch {}

    return res.status(429).json({
      success: false,
      message: 'Aktivitas mencurigakan terdeteksi. IP Anda diblokir selama 24 jam.',
      code: 'AGGRESSIVE_DDOS',
    });
  }

  // Cek DDoS normal
  if (record.count > CONFIG.DDOS_MAX_REQUESTS) {
    record.blocked = true;
    record.blockUntil = now + CONFIG.DDOS_BLOCK_DURATION_MS;
    record.blockReason = 'ddos';
    ipRequestCount.set(ip, record);

    console.warn(`⚠️ DDOS DETECTED: ${ip} — ${record.count} req/min — BLOCKED 30min`);

    return res.status(429).json({
      success: false,
      message: `Terlalu banyak request. Coba lagi dalam ${formatWaitTime(CONFIG.DDOS_BLOCK_DURATION_MS)}.`,
      code: 'DDOS_BLOCKED',
    });
  }

  ipRequestCount.set(ip, record);
  next();
};

// ── 2. Brute Force Protection (khusus auth endpoints) ────────
const bruteForceAttempts = new Map();

exports.bruteForceProtection = (req, res, next) => {
  // Hanya apply ke endpoint auth
  if (!req.path.includes('login') && !req.path.includes('register') && !req.path.includes('forgot')) {
    return next();
  }

  const ip = getRealIP(req);
  const now = Date.now();
  const record = bruteForceAttempts.get(ip) || { count: 0, firstAttempt: now, blocked: false, blockUntil: null };

  // Cek blokir
  if (record.blocked && record.blockUntil && now < record.blockUntil) {
    const waitMs = record.blockUntil - now;
    return res.status(429).json({
      success: false,
      message: `Terlalu banyak percobaan. Coba lagi dalam ${formatWaitTime(waitMs)}.`,
      code: 'BRUTE_FORCE_BLOCKED',
    });
  }

  // Reset window
  if (now - record.firstAttempt > CONFIG.BRUTE_WINDOW_MS) {
    record.count = 0;
    record.firstAttempt = now;
    record.blocked = false;
    record.blockUntil = null;
  }

  // Intercept response untuk track gagal
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode === 401 || res.statusCode === 400) {
      record.count++;
      if (record.count >= CONFIG.BRUTE_MAX_ATTEMPTS) {
        record.blocked = true;
        record.blockUntil = now + CONFIG.BRUTE_BLOCK_DURATION_MS;
        console.warn(`🔐 BRUTE FORCE: ${ip} — ${record.count} failed attempts — BLOCKED 1h`);

        try {
          const { sendSecurityAlert } = require('../utils/alertService');
          sendSecurityAlert('brute_force', {
            ip,
            endpoint: req.path,
            method: req.method,
            userAgent: req.headers['user-agent'],
            email: req.body?.email,
            attempts: record.count,
          });
        } catch {}
      }
      bruteForceAttempts.set(ip, record);
    } else if (res.statusCode === 200 || res.statusCode === 201) {
      // Sukses — reset counter
      bruteForceAttempts.delete(ip);
    }
    return originalJson(body);
  };

  bruteForceAttempts.set(ip, record);
  next();
};

// ── 3. Request Flood Detection ───────────────────────────────
const endpointFlood = new Map();

exports.endpointFloodProtection = (req, res, next) => {
  const ip = getRealIP(req);
  const key = `${ip}:${req.path}`;
  const now = Date.now();
  const record = endpointFlood.get(key) || { count: 0, firstRequest: now };

  if (now - record.firstRequest > 10 * 1000) {
    record.count = 0;
    record.firstRequest = now;
  }

  record.count++;

  // Max 30 request ke endpoint yang sama dalam 10 detik
  if (record.count > 30) {
    console.warn(`🌊 ENDPOINT FLOOD: ${ip} → ${req.path} (${record.count}x in 10s)`);
    return res.status(429).json({
      success: false,
      message: 'Terlalu banyak request ke endpoint ini.',
      code: 'ENDPOINT_FLOOD',
    });
  }

  endpointFlood.set(key, record);
  next();
};

// ── 4. User Agent Validation ─────────────────────────────────
const BLOCKED_UA_PATTERNS = [
  /sqlmap/i, /nikto/i, /nmap/i, /masscan/i, /zgrab/i,
  /dirbuster/i, /gobuster/i, /wfuzz/i, /hydra/i,
  /metasploit/i, /burpsuite/i, /havij/i, /acunetix/i,
];

exports.userAgentFilter = (req, res, next) => {
  const ua = req.headers['user-agent'] || '';

  if (BLOCKED_UA_PATTERNS.some(p => p.test(ua))) {
    const ip = getRealIP(req);
    console.warn(`🚫 BLOCKED UA: ${ip} — ${ua.substring(0, 50)}`);
    ipBlacklist.add(ip); // Blacklist permanen untuk sesi ini

    try {
      const { sendSecurityAlert } = require('../utils/alertService');
      sendSecurityAlert('injection', {
        ip,
        endpoint: req.path,
        method: req.method,
        userAgent: ua,
      });
    } catch {}

    return res.status(403).json({
      success: false,
      message: 'Akses ditolak.',
      code: 'BLOCKED_UA',
    });
  }

  next();
};

// ── 5. Payload Size Bomb Protection ─────────────────────────
exports.payloadBombProtection = (req, res, next) => {
  const contentLength = parseInt(req.headers['content-length'] || '0');

  // Blokir payload > 1MB untuk endpoint auth
  if (req.path.includes('/auth/') && contentLength > 1024 * 1024) {
    return res.status(413).json({
      success: false,
      message: 'Payload terlalu besar.',
      code: 'PAYLOAD_TOO_LARGE',
    });
  }

  // Blokir payload > 10MB untuk semua endpoint
  if (contentLength > 10 * 1024 * 1024) {
    return res.status(413).json({
      success: false,
      message: 'Payload terlalu besar.',
      code: 'PAYLOAD_TOO_LARGE',
    });
  }

  next();
};

// ── 6. Security Response Headers ────────────────────────────
exports.securityResponseHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.removeHeader('X-Powered-By');
  next();
};

// ── Export semua sebagai satu middleware stack ───────────────
exports.firewallStack = [
  exports.securityResponseHeaders,
  exports.userAgentFilter,
  exports.payloadBombProtection,
  exports.ddosProtection,
  exports.endpointFloodProtection,
];

exports.authFirewallStack = [
  exports.bruteForceProtection,
];

// ── Status endpoint untuk monitoring ────────────────────────
exports.getFirewallStatus = () => ({
  blockedIPs: ipBlacklist.size,
  trackedIPs: ipRequestCount.size,
  bruteForceTracked: bruteForceAttempts.size,
  endpointFloodTracked: endpointFlood.size,
});

// ── 7. Rate Limiting Per User (berdasarkan JWT userId) ───────
// Lebih akurat dari per-IP karena tidak bisa di-bypass pakai VPN
const userRateLimit = new Map(); // { userId: { count, firstRequest, blocked, blockUntil } }

const USER_RATE_CONFIG = {
  // General API
  GENERAL_MAX: 300,           // Max 300 request per 15 menit per user
  GENERAL_WINDOW_MS: 15 * 60 * 1000,
  GENERAL_BLOCK_MS: 15 * 60 * 1000,

  // Export (berat, batasi lebih ketat)
  EXPORT_MAX: 20,             // Max 20 export per jam
  EXPORT_WINDOW_MS: 60 * 60 * 1000,
  EXPORT_BLOCK_MS: 60 * 60 * 1000,

  // RAB Generate (berat)
  RAB_MAX: 50,                // Max 50 generate RAB per jam
  RAB_WINDOW_MS: 60 * 60 * 1000,
  RAB_BLOCK_MS: 30 * 60 * 1000,
};

const userExportLimit = new Map();
const userRABLimit = new Map();

function checkUserRate(store, userId, max, windowMs, blockMs) {
  const now = Date.now();
  const rec = store.get(userId) || { count: 0, firstRequest: now, blocked: false, blockUntil: null };

  // Cek masih diblokir
  if (rec.blocked && rec.blockUntil && now < rec.blockUntil) {
    const waitMs = rec.blockUntil - now;
    return { allowed: false, waitMs };
  }

  // Reset window
  if (now - rec.firstRequest > windowMs) {
    rec.count = 0;
    rec.firstRequest = now;
    rec.blocked = false;
    rec.blockUntil = null;
  }

  rec.count++;

  if (rec.count > max) {
    rec.blocked = true;
    rec.blockUntil = now + blockMs;
    store.set(userId, rec);
    return { allowed: false, waitMs: blockMs };
  }

  store.set(userId, rec);
  return { allowed: true };
}

// Middleware: rate limit per user untuk semua protected routes
exports.userRateLimiter = (req, res, next) => {
  // Hanya apply kalau user sudah login (ada req.user dari protect middleware)
  if (!req.user) return next();

  const userId = String(req.user._id || req.user.id);
  const path = req.path;

  // Export endpoint
  if (path.includes('/export')) {
    const result = checkUserRate(userExportLimit, userId,
      USER_RATE_CONFIG.EXPORT_MAX,
      USER_RATE_CONFIG.EXPORT_WINDOW_MS,
      USER_RATE_CONFIG.EXPORT_BLOCK_MS
    );
    if (!result.allowed) {
      const minutes = Math.ceil(result.waitMs / 60000);
      return res.status(429).json({
        success: false,
        message: `Batas export tercapai. Coba lagi dalam ${minutes} menit.`,
        code: 'USER_EXPORT_LIMIT',
      });
    }
    return next();
  }

  // RAB Calculate endpoint
  if (path.includes('/calculate-rab')) {
    const result = checkUserRate(userRABLimit, userId,
      USER_RATE_CONFIG.RAB_MAX,
      USER_RATE_CONFIG.RAB_WINDOW_MS,
      USER_RATE_CONFIG.RAB_BLOCK_MS
    );
    if (!result.allowed) {
      const minutes = Math.ceil(result.waitMs / 60000);
      return res.status(429).json({
        success: false,
        message: `Batas generate RAB tercapai. Coba lagi dalam ${minutes} menit.`,
        code: 'USER_RAB_LIMIT',
      });
    }
    return next();
  }

  // General API
  const result = checkUserRate(userRateLimit, userId,
    USER_RATE_CONFIG.GENERAL_MAX,
    USER_RATE_CONFIG.GENERAL_WINDOW_MS,
    USER_RATE_CONFIG.GENERAL_BLOCK_MS
  );
  if (!result.allowed) {
    const minutes = Math.ceil(result.waitMs / 60000);
    return res.status(429).json({
      success: false,
      message: `Terlalu banyak request. Coba lagi dalam ${minutes} menit.`,
      code: 'USER_RATE_LIMIT',
    });
  }

  next();
};

// Cleanup user rate limit setiap 30 menit
setInterval(() => {
  const now = Date.now();
  for (const [id, rec] of userRateLimit.entries()) {
    if (!rec.blocked && now - rec.firstRequest > USER_RATE_CONFIG.GENERAL_WINDOW_MS * 2) {
      userRateLimit.delete(id);
    }
  }
  for (const [id, rec] of userExportLimit.entries()) {
    if (!rec.blocked && now - rec.firstRequest > USER_RATE_CONFIG.EXPORT_WINDOW_MS * 2) {
      userExportLimit.delete(id);
    }
  }
  for (const [id, rec] of userRABLimit.entries()) {
    if (!rec.blocked && now - rec.firstRequest > USER_RATE_CONFIG.RAB_WINDOW_MS * 2) {
      userRABLimit.delete(id);
    }
  }
}, 30 * 60 * 1000);

// ── 8. CSRF Protection ───────────────────────────────────────
const crypto = require('crypto');
const csrfTokens = new Map(); // { token: { ip, createdAt } }

// Cleanup CSRF tokens setiap 10 menit
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of csrfTokens.entries()) {
    if (now - data.createdAt > 60 * 60 * 1000) { // expire 1 jam
      csrfTokens.delete(token);
    }
  }
}, 10 * 60 * 1000);

exports.generateCSRFToken = (req, res) => {
  const ip = getRealIP(req);
  const token = crypto.randomBytes(32).toString('hex');
  csrfTokens.set(token, { ip, createdAt: Date.now() });
  res.json({ success: true, csrfToken: token });
};

exports.csrfProtection = (req, res, next) => {
  // Skip untuk GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  // Skip untuk auth endpoints (login/register tidak butuh CSRF)
  if (req.path.includes('/auth/')) return next();

  const token = req.headers['x-csrf-token'] || req.body?._csrf;
  if (!token || !csrfTokens.has(token)) {
    console.warn(`🛡️ CSRF BLOCKED: ${getRealIP(req)} → ${req.path}`);
    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF token.',
      code: 'CSRF_INVALID',
    });
  }

  // Hapus token setelah dipakai (one-time use)
  csrfTokens.delete(token);
  next();
};

// ── 9. Request Fingerprinting (Bot Detection) ────────────────
const botFingerprints = new Map(); // { fingerprint: { count, firstSeen } }

function generateFingerprint(req) {
  const ua = req.headers['user-agent'] || '';
  const accept = req.headers['accept'] || '';
  const acceptLang = req.headers['accept-language'] || '';
  const acceptEnc = req.headers['accept-encoding'] || '';
  return crypto.createHash('md5')
    .update(`${ua}:${accept}:${acceptLang}:${acceptEnc}`)
    .digest('hex');
}

// Pola yang menandakan bot/scraper
const BOT_INDICATORS = [
  // Tidak ada Accept-Language (browser selalu kirim ini)
  (req) => !req.headers['accept-language'] && req.method !== 'OPTIONS',
  // Tidak ada Accept header sama sekali
  (req) => !req.headers['accept'],
  // User-Agent kosong
  (req) => !req.headers['user-agent'],
  // Accept hanya *//* tanpa detail (bot sederhana)
  (req) => req.headers['accept'] === '*/*' && !req.headers['accept-language'],
];

exports.botDetection = (req, res, next) => {
  const ip = getRealIP(req);

  // Cek indikator bot
  const botScore = BOT_INDICATORS.filter(check => check(req)).length;

  if (botScore >= 2) {
    console.warn(`🤖 BOT DETECTED: ${ip} → ${req.path} (score: ${botScore})`);

    // Track fingerprint
    const fp = generateFingerprint(req);
    const fpRecord = botFingerprints.get(fp) || { count: 0, firstSeen: Date.now() };
    fpRecord.count++;
    botFingerprints.set(fp, fpRecord);

    // Blacklist kalau sudah terlalu sering
    if (fpRecord.count > 20) {
      ipBlacklist.add(ip);
      try {
        const { sendSecurityAlert } = require('../utils/alertService');
        sendSecurityAlert('brute_force', {
          ip,
          endpoint: req.path,
          method: req.method,
          userAgent: req.headers['user-agent'] || 'EMPTY',
          attempts: fpRecord.count,
        });
      } catch {}
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak.',
        code: 'BOT_BLACKLISTED',
      });
    }

    // Untuk API publik, tetap lanjut tapi log
    // Untuk endpoint sensitif, blokir
    if (req.path.includes('/auth/') || req.path.includes('/export')) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak.',
        code: 'BOT_BLOCKED',
      });
    }
  }

  next();
};

// ── 10. IP Reputation (Lightweight, no external API) ─────────
// Daftar range IP yang dikenal sebagai sumber serangan
// (Tor exit nodes, known bad ASNs - simplified version)
const SUSPICIOUS_RANGES = [
  // Contoh range yang sering dipakai untuk scanning
  // Dalam production bisa di-update secara berkala
];

// IP yang sudah terbukti jahat dari sesi sebelumnya (persistent dalam memory)
const knownBadIPs = new Set();

exports.ipReputationCheck = (req, res, next) => {
  const ip = getRealIP(req);

  // Cek known bad IPs
  if (knownBadIPs.has(ip)) {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak.',
      code: 'BAD_REPUTATION',
    });
  }

  // Auto-add ke known bad IPs kalau sudah di blacklist
  if (ipBlacklist.has(ip)) {
    knownBadIPs.add(ip);
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak.',
      code: 'BLACKLISTED',
    });
  }

  // Cek suspicious ranges
  for (const range of SUSPICIOUS_RANGES) {
    if (ip.startsWith(range)) {
      console.warn(`⚠️ SUSPICIOUS RANGE: ${ip}`);
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak.',
        code: 'SUSPICIOUS_RANGE',
      });
    }
  }

  next();
};

// ── 11. Geo-blocking (Lightweight, header-based) ─────────────
// Vercel inject header CF-IPCountry atau X-Vercel-IP-Country
const BLOCKED_COUNTRIES = [
  // Tambahkan kode negara yang mau diblokir
  // Contoh: 'CN', 'RU', 'KP', 'IR'
  // Kosong = tidak ada geo-blocking
];

const ALLOWED_COUNTRIES = [
  // Kalau diisi, HANYA negara ini yang boleh akses
  // Kosong = semua negara boleh
  // Contoh: ['ID'] = hanya Indonesia
];

exports.geoBlocking = (req, res, next) => {
  // Skip kalau tidak ada konfigurasi
  if (BLOCKED_COUNTRIES.length === 0 && ALLOWED_COUNTRIES.length === 0) {
    return next();
  }

  // Baca country dari Vercel/Cloudflare header
  const country = req.headers['x-vercel-ip-country'] ||
                  req.headers['cf-ipcountry'] ||
                  req.headers['x-country-code'] ||
                  null;

  // Kalau tidak ada header country (development lokal), skip
  if (!country) return next();

  // Cek whitelist (kalau ada)
  if (ALLOWED_COUNTRIES.length > 0 && !ALLOWED_COUNTRIES.includes(country)) {
    console.warn(`🌍 GEO BLOCKED: ${getRealIP(req)} from ${country}`);
    return res.status(403).json({
      success: false,
      message: 'Layanan tidak tersedia di wilayah Anda.',
      code: 'GEO_BLOCKED',
      country,
    });
  }

  // Cek blacklist
  if (BLOCKED_COUNTRIES.includes(country)) {
    console.warn(`🌍 GEO BLOCKED: ${getRealIP(req)} from ${country}`);
    return res.status(403).json({
      success: false,
      message: 'Layanan tidak tersedia di wilayah Anda.',
      code: 'GEO_BLOCKED',
      country,
    });
  }

  next();
};

// ── Update firewallStack dengan layer baru ───────────────────
exports.firewallStack = [
  exports.securityResponseHeaders,
  exports.geoBlocking,
  exports.ipReputationCheck,
  exports.userAgentFilter,
  exports.botDetection,
  exports.payloadBombProtection,
  exports.ddosProtection,
  exports.endpointFloodProtection,
];
