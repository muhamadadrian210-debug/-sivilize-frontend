// Entry point untuk Vercel serverless
// Wrap main app dengan error catching yang proper

let app;
let startupError = null;

try {
  app = require('../index.js');
} catch (err) {
  startupError = err;
  console.error('[STARTUP ERROR]', err.message);
  console.error(err.stack);
}

module.exports = (req, res) => {
  if (startupError) {
    return res.status(500).json({
      success: false,
      error: 'startup_failed',
      message: startupError.message,
      hint: startupError.stack?.split('\n').slice(0, 3).join(' | ')
    });
  }
  if (!app) {
    return res.status(500).json({ success: false, error: 'app_not_loaded' });
  }
  return app(req, res);
};
