// Minimal handler untuk diagnosa
try {
  module.exports = require('../index.js');
} catch (err) {
  module.exports = (req, res) => {
    res.status(500).json({ 
      error: err.message, 
      stack: err.stack?.split('\n').slice(0, 5).join('\n')
    });
  };
}
