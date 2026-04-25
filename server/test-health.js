// Test file untuk diagnosa Vercel deployment
module.exports = (req, res) => {
  res.json({ ok: true, env: { 
    hasJwt: !!process.env.JWT_SECRET,
    hasMongo: !!process.env.MONGODB_URI,
    nodeVersion: process.version
  }});
};
