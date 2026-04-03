const jwt = require('jsonwebtoken');
const { getDb } = require('../config/database');
const JWT_SECRET = process.env.JWT_SECRET || 'finance-dashboard-secret-key';

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer '))
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  try {
    const payload = jwt.verify(authHeader.slice(7), JWT_SECRET);
    const db = await getDb();
    const user = await db.get(`SELECT id,name,email,role,status FROM users WHERE id=?`, payload.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });
    if (user.status === 'inactive') return res.status(403).json({ error: 'Account is inactive' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (!roles.includes(req.user.role))
      return res.status(403).json({ error: `Access denied. Required: ${roles.join('/')}. Yours: ${req.user.role}` });
    next();
  };
}

module.exports = { authenticate, authorize, JWT_SECRET };
