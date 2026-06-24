const express = require('express');
const router = express.Router();
const { addFavorite, removeFavorite, removeFavoriteByProperty, getFavorites, checkFavorite } = require('../controllers/favoriteController');
const { authenticateUser } = require('../middleware/userAuth');

// All routes require authentication
router.use(authenticateUser);

// GET /api/favorites - Get user's favorites
router.get('/', getFavorites);

// POST /api/favorites - Add to favorites
router.post('/', addFavorite);

// GET /api/favorites/check/:propertyId - Check if property is favorited
router.get('/check/:propertyId', checkFavorite);

// DELETE /api/favorites/:id - Remove from favorites by favorite ID
router.delete('/:id', removeFavorite);

// DELETE /api/favorites/property/:propertyId - Remove by property ID
router.delete('/property/:propertyId', removeFavoriteByProperty);

module.exports = router;