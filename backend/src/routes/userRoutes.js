const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile, updateFCMToken, logout } = require('../controllers/userController');
const { authenticateUser } = require('../middleware/userAuth');

// POST /api/auth/register - Register new user
router.post('/register', register);

// POST /api/auth/login - Login user
router.post('/login', login);

// POST /api/auth/logout - Logout user
router.post('/logout', authenticateUser, logout);

// GET /api/auth/profile - Get user profile
router.get('/profile', authenticateUser, getProfile);

// PUT /api/auth/profile - Update user profile
router.put('/profile', authenticateUser, updateProfile);

// PUT /api/auth/fcm-token - Update FCM token
router.put('/fcm-token', authenticateUser, updateFCMToken);

module.exports = router;