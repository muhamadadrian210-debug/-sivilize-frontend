const express = require('express');
const app = express();

// Test apakah basic express jalan
app.get('/health', (req, res) => res.json({ ok: true, v: 'minimal' }));
app.get('/', (req, res) => res.json({ ok: true, v: 'minimal' }));

// Load main app dengan error catching
let mainApp = null;
let loadError = null;

try {
  mainApp = require('../index.js');
} catch (err) {
  loadError = { message: err.message, stack: err.stack?.split('\n').slice(0, 8).join(' | ') };
  console.error('LOAD ERROR:', err.message);
}

app.use((req, res, next) => {
  if (loadError) {
    return res.status(500).json({ error: 'startup_failed', details: loadError });
  }
  if (mainApp) {
    return mainApp(req, res, next);
  }
  next();
});

module.exports = app;
