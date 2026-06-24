const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { query } = require('../config/database');

// Request password reset
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    // Check if user exists
    const userResult = await query('SELECT id, name, email FROM users WHERE email = $1', [email.toLowerCase()]);
    if (userResult.rows.length === 0) {
      // Don't reveal if email exists or not
      return res.json({ success: true, message: 'If the email exists, a reset link has been sent.' });
    }

    const user = userResult.rows[0];

    // Invalidate old tokens
    await query(
      'UPDATE password_reset_tokens SET is_used = true WHERE user_id = $1 AND is_used = false',
      [user.id]
    );

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await query(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, resetToken, expiresAt]
    );

    // In production, send email via SendGrid/SMTP
    console.log(`[Password Reset] Token for ${email}: ${resetToken}`);

    res.json({
      success: true,
      message: 'If the email exists, a reset link has been sent.',
      data: process.env.NODE_ENV === 'development' ? { reset_token: resetToken } : undefined
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ success: false, error: 'Failed to process request' });
  }
};

// Verify reset token
const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    const result = await query(
      `SELECT * FROM password_reset_tokens 
       WHERE token = $1 AND is_used = false AND expires_at > CURRENT_TIMESTAMP`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, error: 'Invalid or expired reset token' });
    }

    res.json({ success: true, message: 'Token is valid', data: { valid: true } });
  } catch (error) {
    console.error('Verify reset token error:', error);
    res.status(500).json({ success: false, error: 'Failed to verify token' });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ success: false, error: 'Token and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    // Verify token
    const tokenResult = await query(
      `SELECT * FROM password_reset_tokens 
       WHERE token = $1 AND is_used = false AND expires_at > CURRENT_TIMESTAMP`,
      [token]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(400).json({ success: false, error: 'Invalid or expired reset token' });
    }

    const userId = tokenResult.rows[0].user_id;

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update password and mark token as used
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, userId]);
    await query(
      'UPDATE password_reset_tokens SET is_used = true, used_at = CURRENT_TIMESTAMP WHERE id = $1',
      [tokenResult.rows[0].id]
    );

    // Invalidate all user sessions
    await query(
      'UPDATE user_sessions SET is_active = false WHERE user_id = $1',
      [userId]
    );

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, error: 'Failed to reset password' });
  }
};

// Change password (authenticated user)
const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ success: false, error: 'Current and new password are required' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ success: false, error: 'New password must be at least 6 characters' });
    }

    // Verify current password
    const userResult = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const isValid = await bcrypt.compare(current_password, userResult.rows[0].password_hash);

    if (!isValid) {
      return res.status(400).json({ success: false, error: 'Current password is incorrect' });
    }

    // Update password
    const passwordHash = await bcrypt.hash(new_password, 10);
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, req.user.id]);

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, error: 'Failed to change password' });
  }
};

module.exports = { requestPasswordReset, verifyResetToken, resetPassword, changePassword };