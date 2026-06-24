const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

let onlineUsers = new Map(); // userId -> Set of socketIds

const setupChatSocket = (io) => {
  // Auth middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'uttarakhand_realestate_jwt_secret_key_2026');
      const user = await query('SELECT id, name, role FROM users WHERE id = $1 AND is_active = true', [decoded.id]);
      
      if (user.rows.length === 0) {
        return next(new Error('User not found'));
      }

      socket.userId = user.rows[0].id;
      socket.userName = user.rows[0].name;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`🔵 User connected: ${socket.userName} (${userId})`);

    // Track online users
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Join personal room
    socket.join(`user:${userId}`);

    // Broadcast online status
    io.emit('user:online', { userId, isOnline: true });

    // Send current online users
    socket.emit('users:online', Array.from(onlineUsers.keys()));

    // Handle joining a chat room
    socket.on('chat:join', ({ receiverId }) => {
      const roomId = [userId, receiverId].sort().join(':');
      socket.join(`chat:${roomId}`);
      console.log(`${socket.userName} joined room: chat:${roomId}`);
    });

    // Handle sending a message
    socket.on('chat:send', async (data, callback) => {
      try {
        const { receiverId, message, propertyId } = data;

        if (!receiverId || !message) {
          return callback({ success: false, error: 'Receiver and message are required' });
        }

        // Save message to database
        const result = await query(
          `INSERT INTO chat_messages (sender_id, receiver_id, property_id, message)
           VALUES ($1, $2, $3, $4) RETURNING *`,
          [userId, receiverId, propertyId || null, message]
        );

        const newMessage = result.rows[0];

        // Get sender info
        const senderInfo = await query('SELECT name, profile_image FROM users WHERE id = $1', [userId]);

        const messageData = {
          ...newMessage,
          sender_name: senderInfo.rows[0]?.name || 'Unknown',
          sender_image: senderInfo.rows[0]?.profile_image
        };

        // Send to receiver's personal room
        io.to(`user:${receiverId}`).emit('chat:message', messageData);

        // Send to chat room
        const roomId = [userId, receiverId].sort().join(':');
        io.to(`chat:${roomId}`).emit('chat:message', messageData);

        // Send notification to receiver if online
        io.to(`user:${receiverId}`).emit('notification:new', {
          type: 'chat',
          title: `New message from ${senderInfo.rows[0]?.name || 'Someone'}`,
          body: message.substring(0, 100),
          data: { sender_id: userId, property_id: propertyId }
        });

        callback({ success: true, data: messageData });
      } catch (error) {
        console.error('Socket send message error:', error);
        callback({ success: false, error: 'Failed to send message' });
      }
    });

    // Handle typing status
    socket.on('chat:typing', ({ receiverId, isTyping }) => {
      io.to(`user:${receiverId}`).emit('chat:typing', {
        senderId: userId,
        senderName: socket.userName,
        isTyping
      });
    });

    // Handle message read status
    socket.on('chat:read', async ({ senderId }) => {
      try {
        await query(
          `UPDATE chat_messages SET is_read = true, read_at = CURRENT_TIMESTAMP
           WHERE sender_id = $1 AND receiver_id = $2 AND is_read = false`,
          [senderId, userId]
        );
        io.to(`user:${senderId}`).emit('chat:read', { readBy: userId });
      } catch (error) {
        console.error('Mark as read error:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`🔴 User disconnected: ${socket.userName} (${userId})`);

      if (onlineUsers.has(userId)) {
        onlineUsers.get(userId).delete(socket.id);
        if (onlineUsers.get(userId).size === 0) {
          onlineUsers.delete(userId);
          io.emit('user:online', { userId, isOnline: false });
        }
      }
    });
  });
};

// Get online status of a user
const isUserOnline = (userId) => {
  return onlineUsers.has(userId) && onlineUsers.get(userId).size > 0;
};

module.exports = { setupChatSocket, isUserOnline };