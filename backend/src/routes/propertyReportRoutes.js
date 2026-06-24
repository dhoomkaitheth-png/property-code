const express = require('express');
const router = express.Router();
const propertyReportController = require('../controllers/propertyReportController');
const { authenticate, authorize } = require('../middleware/auth');
const { optionalAuth } = require('../middleware/userAuth');

// Public route (with optional auth for logged-in users)
router.post('/', optionalAuth, propertyReportController.reportProperty);

// Admin routes
router.get('/', authenticate, authorize('super_admin', 'admin'), propertyReportController.getReports);
router.put('/:id/status', authenticate, authorize('super_admin', 'admin'), propertyReportController.updateReportStatus);

module.exports = router;