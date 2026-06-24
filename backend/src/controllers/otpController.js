const { query } = require('../config/database');
const crypto = require('crypto');

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP
const sendOTP = async (req, res) => {
  try {
    const { mobile, email, purpose } = req.body;

    if (!mobile) {
      return res.status(400).json({ success: false, error: 'Mobile number is required' });
    }

    // Check rate limiting - max 3 OTPs per mobile per hour
    const recentOTPs = await query(
      `SELECT COUNT(*) FROM otp_verification 
       WHERE mobile = $1 AND created_at > NOW() - INTERVAL '1 hour'`,
      [mobile]
    );

    if (parseInt(recentOTPs.rows[0].count) >= 3) {
      return res.status(429).json({ 
        success: false, 
        error: 'Too many OTP requests. Please try again after 1 hour.' 
      });
    }

    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP
    await query(
      `INSERT INTO otp_verification (mobile, email, otp_code, purpose, expires_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [mobile, email || null, otpCode, purpose || 'registration', expiresAt]
    );

    // In production, send SMS via Twilio/MSG91
    console.log(`[OTP] Sending OTP ${otpCode} to ${mobile}`);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        // In production, remove OTP from response
        otp: process.env.NODE_ENV === 'development' ? otpCode : undefined,
        expires_in: 600
      }
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ success: false, error: 'Failed to send OTP' });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { mobile, otp_code, purpose } = req.body;

    if (!mobile || !otp_code) {
      return res.status(400).json({ success: false, error: 'Mobile and OTP are required' });
    }

    // Find valid OTP
    const result = await query(
      `SELECT * FROM otp_verification 
       WHERE mobile = $1 AND otp_code = $2 AND purpose = $3 
       AND is_verified = false AND expires_at > CURRENT_TIMESTAMP
       ORDER BY created_at DESC LIMIT 1`,
      [mobile, otp_code, purpose || 'registration']
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
    }

    // Mark as verified
    await query(
      'UPDATE otp_verification SET is_verified = true, verified_at = CURRENT_TIMESTAMP WHERE id = $1',
      [result.rows[0].id]
    );

    res.json({
      success: true,
      message: 'OTP verified successfully',
      data: { verified: true }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, error: 'Failed to verify OTP' });
  }
};

// Verify OTP and login/register
const verifyOTPAndLogin = async (req, res) => {
  try {
    const { mobile, otp_code, name, email } = req.body;

    if (!mobile || !otp_code) {
      return res.status(400).json({ success: false, error: 'Mobile and OTP are required' });
    }

    // Verify OTP first
    const otpResult = await query(
      `SELECT * FROM otp_verification 
       WHERE mobile = $1 AND otp_code = $2 AND purpose = 'login'
       AND is_verified = false AND expires_at > CURRENT_TIMESTAMP
       ORDER BY created_at DESC LIMIT 1`,
      [mobile, otp_code]
    );

    if (otpResult.rows.length === 0) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
    }

    // Mark OTP as verified
    await query(
      'UPDATE otp_verification SET is_verified = true, verified_at = CURRENT_TIMESTAMP WHERE id = $1',
      [otpResult.rows[0].id]
    );

    // Check if user exists
    let userResult = await query('SELECT * FROM users WHERE mobile = $1', [mobile]);

    if (userResult.rows.length === 0) {
      // Register new user
      if (!name) {
        return res.status(400).json({ success: false, error: 'Name is required for registration' });
      }

      const { v4: uuidv4 } = require('uuid');
      const bcrypt = require('bcryptjs');
      const jwt = require('jsonwebtoken');

      const userId = uuidv4();
      const tempPassword = crypto.randomBytes(8).toString('hex');
      const passwordHash = await bcrypt.hash(tempPassword, 10);

      await query(
        `INSERT INTO users (id, name, email, mobile, password_hash, role, is_verified)
         VALUES ($1, $2, $3, $4, $5, 'buyer', true)`,
        [userId, name, (email || mobile + '@user.com').toLowerCase(), mobile, passwordHash]
      );

      const token = jwt.sign(
        { id: userId, role: 'buyer' },
        process.env.JWT_SECRET || 'uttarakhand_realestate_jwt_secret_key_2026',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          token,
          user: { id: userId, name, email: email || null, mobile, role: 'buyer', is_new: true }
        }
      });
    }

    // Login existing user
    const user = userResult.rows[0];
    const jwt = require('jsonwebtoken');

    await query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'uttarakhand_realestate_jwt_secret_key_2026',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
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
    console.error('OTP login error:', error);
    res.status(500).json({ success: false, error: 'Authentication failed' });
  }
};

module.exports = { sendOTP, verifyOTP, verifyOTPAndLogin };