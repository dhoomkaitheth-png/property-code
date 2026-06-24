const express = require('express');
const router = express.Router();
const contactEnquiryController = require('../controllers/contactEnquiryController');
const { authenticate, authorize } = require('../middleware/auth');

// Public route
router.post('/', contactEnquiryController.createEnquiry);

// Admin routes
router.get('/', authenticate, authorize('super_admin', 'admin'), contactEnquiryController.getEnquiries);
router.put('/:id/read', authenticate, authorize('super_admin', 'admin'), contactEnquiryController.markAsRead);
router.delete('/:id', authenticate, authorize('super_admin', 'admin'), contactEnquiryController.deleteEnquiry);

module.exports = router;