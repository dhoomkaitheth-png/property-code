const express = require('express');
const router = express.Router();
const { createLead, getSellerLeads, getBuyerLeads, updateLeadStatus } = require('../controllers/leadController');
const { authenticateUser } = require('../middleware/userAuth');

// All routes require authentication
router.use(authenticateUser);

// POST /api/leads - Create a lead (buyer interested in property)
router.post('/', createLead);

// GET /api/leads/seller - Get leads for seller's properties
router.get('/seller', getSellerLeads);

// GET /api/leads/buyer - Get leads by buyer
router.get('/buyer', getBuyerLeads);

// PUT /api/leads/:id/status - Update lead status
router.put('/:id/status', updateLeadStatus);

module.exports = router;