const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Authenticate regular users (buyers/sellers)
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'uttarakhand_realestate_jwt_secret_key_2026');

    const result = await query(
      'SELECT id, name, email, mobile, role, profile_image FROM users WHERE id = $1 AND is_active = true',
      [decoded.id]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    }
    return res.status(500).json({ error: 'Authentication failed.' });
  }
};

// Optional auth - doesn't fail if no token, but sets req.user if valid
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'uttarakhand_realestate_jwt_secret_key_2026');
      const result = await query(
        'SELECT id, name, email, mobile, role FROM users WHERE id = $1 AND is_active = true',
        [decoded.id]
      );
      if (result.rows.length > 0) {
        req.user = result.rows[0];
      }
    }
  } catch (error) {
    // Token invalid or expired, continue without user
  }
  next();
};

module.exports = { authenticateUser, optionalAuth };