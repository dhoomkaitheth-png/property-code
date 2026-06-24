const express = require('express');
const router = express.Router();
const scheduledVisitController = require('../controllers/scheduledVisitController');
const { authenticateUser } = require('../middleware/userAuth');

// All routes require authentication
router.post('/', authenticateUser, scheduledVisitController.scheduleVisit);
router.get('/my-visits', authenticateUser, scheduledVisitController.getMyVisits);
router.get('/property/:property_id', authenticateUser, scheduledVisitController.getPropertyVisits);
router.put('/:id/status', authenticateUser, scheduledVisitController.updateVisitStatus);
router.put('/:id/cancel', authenticateUser, scheduledVisitController.cancelVisit);

module.exports = router;