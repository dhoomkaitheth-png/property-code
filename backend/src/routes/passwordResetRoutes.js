const express = require('express');
const router = express.Router();
const passwordResetController = require('../controllers/passwordResetController');
const { authenticateUser } = require('../middleware/userAuth');

// Public routes
router.post('/request', passwordResetController.requestPasswordReset);
router.get('/verify/:token', passwordResetController.verifyResetToken);
router.post('/reset', passwordResetController.resetPassword);

// Protected routes
router.post('/change', authenticateUser, passwordResetController.changePassword);

module.exports = router;