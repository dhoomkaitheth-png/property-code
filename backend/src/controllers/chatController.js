const { query } = require('../config/database');

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { receiver_id, property_id, message } = req.body;

    if (!receiver_id || !message) {
      return res.status(400).json({ success: false, error: 'Receiver and message are required' });
    }

    const result = await query(
      `INSERT INTO chat_messages (sender_id, receiver_id, property_id, message)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.id, receiver_id, property_id || null, message]
    );

    // Create notification for receiver
    const sender = await query('SELECT name FROM users WHERE id = $1', [req.user.id]);
    const senderName = sender.rows[0]?.name || 'Someone';

    await query(
      `INSERT INTO notifications (user_id, title, body, type, reference_type, reference_id, data)
       VALUES ($1, $2, $3, 'chat', 'user', $4, $5::jsonb)`,
      [receiver_id, `New message from ${senderName}`, message.substring(0, 100), req.user.id, JSON.stringify({ sender_id: req.user.id, property_id })]
    );

    res.status(201).json({ success: true, message: 'Message sent', data: result.rows[0] });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
};

// Get conversation between two users
const getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const countResult = await query(
      `SELECT COUNT(*) FROM chat_messages
       WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)`,
      [req.user.id, userId]
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await query(
      `SELECT cm.*, u.name as sender_name, u.profile_image as sender_image
       FROM chat_messages cm
       JOIN users u ON cm.sender_id = u.id
       WHERE (cm.sender_id = $1 AND cm.receiver_id = $2) OR (cm.sender_id = $2 AND cm.receiver_id = $1)
       ORDER BY cm.sent_at DESC
       LIMIT $3 OFFSET $4`,
      [req.user.id, userId, limit, offset]
    );

    // Mark messages as read
    await query(
      `UPDATE chat_messages SET is_read = true, read_at = CURRENT_TIMESTAMP
       WHERE sender_id = $1 AND receiver_id = $2 AND is_read = false`,
      [userId, req.user.id]
    );

    res.json({
      success: true,
      count: result.rows.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: result.rows.reverse() // Return in chronological order
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ success: false, error: 'Failed to get messages' });
  }
};

// Get user's conversations list
const getConversations = async (req, res) => {
  try {
    const result = await query(
      `SELECT DISTINCT ON (other_user.id)
              other_user.id as user_id,
              other_user.name as user_name,
              other_user.profile_image as user_image,
              cm.message as last_message,
              cm.sent_at as last_message_time,
              cm.sender_id as last_sender_id,
              COUNT(CASE WHEN cm2.is_read = false AND cm2.receiver_id = $1 THEN 1 END) as unread_count
       FROM chat_messages cm
       JOIN chat_messages cm2 ON cm.id = cm2.id
       JOIN users other_user ON (other_user.id = CASE WHEN cm.sender_id = $1 THEN cm.receiver_id ELSE cm.sender_id END)
       WHERE cm.sender_id = $1 OR cm.receiver_id = $1
       ORDER BY other_user.id, cm.sent_at DESC`,
      [req.user.id]
    );

    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ success: false, error: 'Failed to get conversations' });
  }
};

// Get unread message count
const getUnreadCount = async (req, res) => {
  try {
    const result = await query(
      'SELECT COUNT(*)::int as unread_count FROM chat_messages WHERE receiver_id = $1 AND is_read = false',
      [req.user.id]
    );

    res.json({ success: true, data: { unread_count: result.rows[0].unread_count } });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ success: false, error: 'Failed to get unread count' });
  }
};

module.exports = { sendMessage, getConversation, getConversations, getUnreadCount };