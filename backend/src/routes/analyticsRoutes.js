const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate, authorize } = require('../middleware/auth');
const { authenticateUser } = require('../middleware/userAuth');

// Admin analytics (protected - admin only)
router.get('/admin', authenticate, authorize('super_admin', 'admin'), analyticsController.getAdminAnalytics);
router.get('/property-types', authenticate, authorize('super_admin', 'admin'), analyticsController.getPropertyTypeDistribution);
router.get('/districts', authenticate, authorize('super_admin', 'admin'), analyticsController.getDistrictWiseStats);
router.get('/monthly-trends', authenticate, authorize('super_admin', 'admin'), analyticsController.getMonthlyTrends);
router.get('/user-trends', authenticate, authorize('super_admin', 'admin'), analyticsController.getUserRegistrationTrends);
router.get('/revenue', authenticate, authorize('super_admin', 'admin'), analyticsController.getRevenueAnalytics);
router.get('/searches', authenticate, authorize('super_admin', 'admin'), analyticsController.getSearchAnalytics);

// Seller analytics (protected)
router.get('/seller', authenticateUser, analyticsController.getSellerAnalytics);

module.exports = router;