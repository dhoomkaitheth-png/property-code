const express = require('express');
const router = express.Router();
const {
  createProperty,
  getProperties,
  getProperty,
  updateProperty,
  deleteProperty,
  getFeaturedProperties,
  getPropertyStats,
  uploadImages,
} = require('../controllers/propertyController');
const { authenticate } = require('../middleware/auth');
const { uploadPropertyImage } = require('../middleware/upload');

// GET /api/properties - Get all properties (with filters)
router.get('/', getProperties);

// GET /api/properties/featured - Get featured properties
router.get('/featured', getFeaturedProperties);

// GET /api/properties/stats - Get property statistics
router.get('/stats', getPropertyStats);

// GET /api/properties/:id - Get single property
router.get('/:id', getProperty);

// POST /api/properties - Create new property
router.post('/', createProperty);

// PUT /api/properties/:id - Update property
router.put('/:id', authenticate, updateProperty);

// DELETE /api/properties/:id - Delete property (soft)
router.delete('/:id', authenticate, deleteProperty);

// POST /api/properties/:id/images - Upload property images
router.post('/:id/images', authenticate, uploadPropertyImage.array('images', 10), uploadImages);

module.exports = router;