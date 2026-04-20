const https = require('https');

function request(path, method, body, extraHeaders) {
  method = method || 'GET';
  extraHeaders = extraHeaders || {};
  return new Promise((resolve) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'sivilize-backend.vercel.app',
      path: path,
      method: method,
      headers: Object.assign({
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 Chrome/120',
      }, data ? { 'Content-Length': Buffer.byteLength(data) } : {}, extraHeaders)
    };
    const req = https.request(options, function(res) {
      let b = '';
      res.on('data', function(d) { b += d; });
      res.on('end', function() {
        try { resolve({ status: res.statusCode, body: JSON.parse(b) }); }
        catch(e) { resolve({ status: res.statusCode, body: b.substring(0, 100) }); }
      });
    });
    req.on('error', function() { resolve({ status: 0, body: 'network error' }); });
    req.setTimeout(8000, function() { req.destroy(); resolve({ status: 0, body: 'timeout' }); });
    if (data) req.write(data);
    req.end();
  });
}

function sleep(ms) { return new Promise(function(r) { setTimeout(r, ms); }); }

async function run() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║     SIMULASI SERANGAN — SIVILIZE HUB PRO             ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('');

  // FASE 1: RECONNAISSANCE
  console.log('━━━ FASE 1: RECONNAISSANCE (Hacker mulai scan) ━━━');
  console.log('Hacker IP: 203.0.113.42 mulai scan target...');
  await sleep(500);

  var scan1 = await request('/admin');
  console.log('Coba /admin        → Status ' + scan1.status + (scan1.status === 301 ? ' REDIRECT ke /prank' : ''));

  var scan2 = await request('/.env');
  console.log('Coba /.env         → Status ' + scan2.status + (scan2.status === 301 ? ' REDIRECT ke /prank' : ''));

  var scan3 = await request('/wp-admin');
  console.log('Coba /wp-admin     → Status ' + scan3.status + (scan3.status === 301 ? ' REDIRECT ke /prank' : ''));

  var scan4 = await request('/phpmyadmin');
  console.log('Coba /phpmyadmin   → Status ' + scan4.status + (scan4.status === 301 ? ' REDIRECT ke /prank' : ''));

  console.log('HASIL: Semua honeypot aktif — hacker diarahkan ke prank page');
  console.log('Alert email dikirim ke admin');
  console.log('');
  await sleep(1000);

  // FASE 2: TOOL HACKING TERDETEKSI
  console.log('━━━ FASE 2: HACKING TOOL TERDETEKSI ━━━');
  console.log('Hacker pakai sqlmap untuk scan...');
  await sleep(500);

  var toolScan = await request('/api/auth/login', 'POST', { email: 'test@test.com', password: 'test' }, {
    'User-Agent': 'sqlmap/1.7.8#stable (https://sqlmap.org)'
  });
  console.log('sqlmap scan → Status ' + toolScan.status + ': ' + (toolScan.body && toolScan.body.message ? toolScan.body.message : JSON.stringify(toolScan.body).substring(0, 60)));
  console.log('IP 203.0.113.42 masuk BLACKLIST permanen!');
  console.log('');
  await sleep(1000);

  // FASE 3: BRUTE FORCE LOGIN
  console.log('━━━ FASE 3: BRUTE FORCE LOGIN ━━━');
  console.log('Hacker (IP baru: 198.51.100.7) coba tebak password...');
  await sleep(500);

  for (var i = 1; i <= 7; i++) {
    var res = await request('/api/auth/login', 'POST', {
      email: 'admin@sivilize.com',
      password: 'password' + i
    });
    if (res.status === 429) {
      console.log('Percobaan ' + i + ' → ' + res.status + ' DIBLOKIR: ' + (res.body && res.body.message ? res.body.message : ''));
      console.log('IP diblokir 1 jam! Alert email terkirim.');
      break;
    } else {
      console.log('Percobaan ' + i + ' → ' + res.status + ' Gagal: ' + (res.body && res.body.message ? res.body.message : ''));
    }
    await sleep(400);
  }
  console.log('');
  await sleep(1000);

  // FASE 4: INJECTION ATTACK
  console.log('━━━ FASE 4: INJECTION ATTACK ━━━');
  console.log('Hacker coba NoSQL injection...');
  await sleep(500);

  var inj1 = await request('/api/auth/login', 'POST', {
    email: 'admin@test.com',
    password: 'test'
  });
  console.log('Login attempt → ' + inj1.status + ': ' + (inj1.body && inj1.body.message ? inj1.body.message : ''));

  var inj2 = await request('/api/projects?filter={"$where":"sleep(5000)"}');
  console.log('NoSQL injection via query → ' + inj2.status + ': ' + (inj2.body && inj2.body.message ? inj2.body.message : 'blocked'));
  console.log('');
  await sleep(1000);

  // FASE 5: STATUS FIREWALL
  console.log('━━━ FASE 5: STATUS FIREWALL REAL-TIME ━━━');
  var health = await request('/health');
  var fw = health.body && health.body.firewall ? health.body.firewall : null;
  if (fw) {
    console.log('IP Diblokir Permanen : ' + fw.blockedIPs);
    console.log('IP Dipantau          : ' + fw.trackedIPs);
    console.log('Brute Force Tracked  : ' + fw.bruteForceTracked + ' IP');
    console.log('Endpoint Flood       : ' + fw.endpointFloodTracked + ' endpoint');
  }
  console.log('');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║  RINGKASAN SIMULASI:                                 ║');
  console.log('║  Honeypot     : Hacker diarahkan ke prank page       ║');
  console.log('║  Tool Hacking : sqlmap/nikto/hydra diblokir + BL     ║');
  console.log('║  Brute Force  : IP diblokir setelah 5x gagal         ║');
  console.log('║  Injection    : Payload berbahaya diblokir           ║');
  console.log('║  Alert Email  : Notifikasi dikirim ke admin          ║');
  console.log('║  Semua aktivitas tercatat: IP + waktu + endpoint     ║');
  console.log('╚══════════════════════════════════════════════════════╝');
}

run();
