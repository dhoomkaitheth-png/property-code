const express = require('express');
const router = express.Router();
const otpController = require('../controllers/otpController');

// Public routes
router.post('/send', otpController.sendOTP);
router.post('/verify', otpController.verifyOTP);
router.post('/verify-login', otpController.verifyOTPAndLogin);

module.exports = router;