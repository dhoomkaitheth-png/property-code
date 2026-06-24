const { query } = require('../config/database');

// Add property to favorites
const addFavorite = async (req, res) => {
  try {
    const { property_id } = req.body;
    if (!property_id) {
      return res.status(400).json({ success: false, error: 'Property ID is required' });
    }

    // Check if property exists
    const property = await query('SELECT id FROM properties WHERE id = $1 AND is_active = true', [property_id]);
    if (property.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }

    // Check if already favorited
    const existing = await query(
      'SELECT id FROM favorites WHERE user_id = $1 AND property_id = $2',
      [req.user.id, property_id]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, error: 'Property already in favorites' });
    }

    await query(
      'INSERT INTO favorites (user_id, property_id) VALUES ($1, $2)',
      [req.user.id, property_id]
    );

    res.status(201).json({ success: true, message: 'Added to favorites' });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ success: false, error: 'Failed to add favorite' });
  }
};

// Remove from favorites
const removeFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      'DELETE FROM favorites WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Favorite not found' });
    }

    res.json({ success: true, message: 'Removed from favorites' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ success: false, error: 'Failed to remove favorite' });
  }
};

// Remove by property ID
const removeFavoriteByProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const result = await query(
      'DELETE FROM favorites WHERE user_id = $1 AND property_id = $2 RETURNING id',
      [req.user.id, propertyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Favorite not found' });
    }

    res.json({ success: true, message: 'Removed from favorites' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ success: false, error: 'Failed to remove favorite' });
  }
};

// Get user's favorites
const getFavorites = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const countResult = await query(
      'SELECT COUNT(*) FROM favorites WHERE user_id = $1',
      [req.user.id]
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await query(
      `SELECT f.id as favorite_id, f.created_at as favorited_at,
              p.*, d.district_name, t.tehsil_name, v.village_name
       FROM favorites f
       JOIN properties p ON f.property_id = p.id
       JOIN districts d ON p.district_id = d.id
       JOIN tehsils t ON p.tehsil_id = t.id
       JOIN villages v ON p.village_id = v.id
       WHERE f.user_id = $1 AND p.is_active = true
       ORDER BY f.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    res.json({
      success: true,
      count: result.rows.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: result.rows
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ success: false, error: 'Failed to get favorites' });
  }
};

// Check if property is favorited
const checkFavorite = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const result = await query(
      'SELECT id FROM favorites WHERE user_id = $1 AND property_id = $2',
      [req.user.id, propertyId]
    );

    res.json({
      success: true,
      is_favorite: result.rows.length > 0,
      favorite_id: result.rows[0]?.id || null
    });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({ success: false, error: 'Failed to check favorite status' });
  }
};

module.exports = { addFavorite, removeFavorite, removeFavoriteByProperty, getFavorites, checkFavorite };