const express = require('express');
const router = express.Router();
const { sendMessage, getConversation, getConversations, getUnreadCount } = require('../controllers/chatController');
const { authenticateUser } = require('../middleware/userAuth');

// All routes require authentication
router.use(authenticateUser);

// GET /api/chat/conversations - Get user's conversations list
router.get('/conversations', getConversations);

// GET /api/chat/unread - Get unread message count
router.get('/unread', getUnreadCount);

// GET /api/chat/:userId - Get conversation with specific user
router.get('/:userId', getConversation);

// POST /api/chat/send - Send a message
router.post('/send', sendMessage);

module.exports = router;