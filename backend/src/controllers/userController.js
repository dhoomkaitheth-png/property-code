const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, getClient } = require('../config/database');
// Register new user (buyer/seller)
const register = async (req, res) => {
  try {
    const { name, email, mobile, password, role } = req.body;

    if (!name || !email || !mobile || !password) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    // Check existing user
    const existing = await query(
      'SELECT id FROM users WHERE email = $1 OR mobile = $2',
      [email.toLowerCase(), mobile]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, error: 'Email or mobile already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO users (name, email, mobile, password_hash, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [name, email.toLowerCase(), mobile, passwordHash, role || 'buyer']
    );
    const userId = result.rows[0].id;

    const token = jwt.sign(
      { id: userId, role: role || 'buyer' },
      process.env.JWT_SECRET || 'uttarakhand_realestate_jwt_secret_key_2026',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Store session
    await query(
      'INSERT INTO user_sessions (user_id, token, ip_address) VALUES ($1, $2, $3)',
      [userId, token, req.ip]
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token,
        user: { id: userId, name, email: email.toLowerCase(), mobile, role: role || 'buyer' }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, mobile, password } = req.body;
    const identifier = email || mobile;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, error: 'Email/mobile and password are required' });
    }

    const result = await query(
      'SELECT id, name, email, mobile, password_hash, role, profile_image, is_active FROM users WHERE email = $1 OR mobile = $2',
      [identifier.toLowerCase(), identifier]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    if (!user.is_active) {
      return res.status(401).json({ success: false, error: 'Account is deactivated' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Update last login
    await query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'uttarakhand_realestate_jwt_secret_key_2026',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Store session
    await query(
      'INSERT INTO user_sessions (user_id, token, ip_address) VALUES ($1, $2, $3)',
      [user.id, token, req.ip]
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          profile_image: user.profile_image
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const result = await query(
      `SELECT u.id, u.name, u.email, u.mobile, u.role, u.profile_image, u.is_verified, u.created_at,
              COUNT(DISTINCT f.id) as total_favorites,
              COUNT(DISTINCT l.id) as total_leads
       FROM users u
       LEFT JOIN favorites f ON u.id = f.user_id
       LEFT JOIN leads l ON u.id = l.buyer_id
       WHERE u.id = $1
       GROUP BY u.id`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to get profile' });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, mobile } = req.body;
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (name) { updates.push(`name = $${paramIndex++}`); params.push(name); }
    if (mobile) { updates.push(`mobile = $${paramIndex++}`); params.push(mobile); }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }

    params.push(req.user.id);
    const result = await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id, name, email, mobile, role, profile_image`,
      params
    );

    res.json({ success: true, message: 'Profile updated', data: result.rows[0] });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
};

// Update FCM token
const updateFCMToken = async (req, res) => {
  try {
    const { fcm_token } = req.body;
    await query('UPDATE users SET fcm_token = $1 WHERE id = $2', [fcm_token, req.user.id]);
    res.json({ success: true, message: 'FCM token updated' });
  } catch (error) {
    console.error('FCM token update error:', error);
    res.status(500).json({ success: false, error: 'Failed to update FCM token' });
  }
};

// Logout
const logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    if (token) {
      await query('UPDATE user_sessions SET is_active = false WHERE token = $1', [token]);
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, error: 'Logout failed' });
  }
};

module.exports = { register, login, getProfile, updateProfile, updateFCMToken, logout };