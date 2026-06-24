const { query } = require('../config/database');

// Get user's notifications
const getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const type = req.query.type;

    let whereClause = 'WHERE user_id = $1';
    const params = [req.user.id];
    let paramIndex = 2;

    if (type) {
      whereClause += ` AND type = $${paramIndex++}`;
      params.push(type);
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM notifications ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    params.push(limit, offset);
    const result = await query(
      `SELECT * FROM notifications ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      params
    );

    res.json({
      success: true,
      count: result.rows.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: result.rows
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, error: 'Failed to get notifications' });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `UPDATE notifications SET is_read = true, read_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    res.json({ success: true, message: 'Marked as read', data: result.rows[0] });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ success: false, error: 'Failed to mark as read' });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    await query(
      `UPDATE notifications SET is_read = true, read_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND is_read = false`,
      [req.user.id]
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ success: false, error: 'Failed to mark all as read' });
  }
};

// Get unread notification count
const getUnreadCount = async (req, res) => {
  try {
    const result = await query(
      'SELECT COUNT(*)::int as unread_count FROM notifications WHERE user_id = $1 AND is_read = false',
      [req.user.id]
    );

    res.json({ success: true, data: { unread_count: result.rows[0].unread_count } });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ success: false, error: 'Failed to get unread count' });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete notification' });
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead, getUnreadCount, deleteNotification };