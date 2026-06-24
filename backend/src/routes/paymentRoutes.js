const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateUser } = require('../middleware/userAuth');

// Public routes
router.get('/plans', paymentController.getPlans);

// Protected routes
router.post('/create-order', authenticateUser, paymentController.createOrder);
router.post('/verify', authenticateUser, paymentController.verifyPayment);
router.get('/subscriptions', authenticateUser, paymentController.getUserSubscriptions);
router.get('/subscriptions/active', authenticateUser, paymentController.getActiveSubscription);
router.get('/history', authenticateUser, paymentController.getPaymentHistory);

module.exports = router;