const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Create a new property
const createProperty = async (req, res) => {
  try {
    const {
      district_id, tehsil_id, village_id, local_address,
      latitude, longitude, full_address, pincode,
      title, description, property_type, listing_type,
      price, price_per_sqft, is_price_negotiable,
      total_area, area_unit, plot_area, built_up_area, carpet_area,
      bedrooms, bathrooms, balconies, floors, total_floors, furnishing_status,
      amenities, owner_name, owner_phone, owner_email, is_owner,
      year_built, possession_date
    } = req.body;

    // Validation
    if (!district_id || !tehsil_id || !village_id || !local_address) {
      return res.status(400).json({ success: false, error: 'Location fields are required' });
    }
    if (!title || title.length < 5) {
      return res.status(400).json({ success: false, error: 'Title must be at least 5 characters' });
    }
    if (!price || price <= 0) {
      return res.status(400).json({ success: false, error: 'Valid price is required' });
    }
    if (!total_area || total_area <= 0) {
      return res.status(400).json({ success: false, error: 'Valid total area is required' });
    }
    if (!owner_phone) {
      return res.status(400).json({ success: false, error: 'Owner phone is required' });
    }

    const propertyId = uuidv4();

    const result = await query(
      `INSERT INTO properties (
        id, district_id, tehsil_id, village_id, local_address,
        latitude, longitude, full_address, pincode,
        title, description, property_type, listing_type,
        price, price_per_sqft, is_price_negotiable,
        total_area, area_unit, plot_area, built_up_area, carpet_area,
        bedrooms, bathrooms, balconies, floors, total_floors, furnishing_status,
        amenities, owner_name, owner_phone, owner_email, is_owner,
        year_built, possession_date,
        created_by, updated_by
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9,
        $10, $11, $12, $13,
        $14, $15, $16,
        $17, $18, $19, $20, $21,
        $22, $23, $24, $25, $26, $27,
        $28::jsonb, $29, $30, $31, $32,
        $33, $34,
        $35, $36
      ) RETURNING *`,
      [
        propertyId, district_id, tehsil_id, village_id, local_address,
        latitude || null, longitude || null, full_address || null, pincode || null,
        title, description || null, property_type || 'other', listing_type || 'sell',
        price, price_per_sqft || null, is_price_negotiable !== false,
        total_area, area_unit || 'sqft', plot_area || null, built_up_area || null, carpet_area || null,
        bedrooms || 0, bathrooms || 0, balconies || 0, floors || 1, total_floors || 1, furnishing_status || null,
        JSON.stringify(amenities || []), owner_name || null, owner_phone, owner_email || null, is_owner !== false,
        year_built || null, possession_date || null,
        req.user?.username || 'anonymous', req.user?.username || 'anonymous'
      ]
    );

    const property = result.rows[0];

    // Log the activity
    console.log(`Property created: ${property.id} - ${property.title}`);

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      data: property
    });
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({ success: false, error: 'Failed to create property', details: error.message });
  }
};

// Get all properties with filters
const getProperties = async (req, res) => {
  try {
    const {
      district_id, tehsil_id, village_id,
      property_type, listing_type,
      min_price, max_price,
      min_area, max_area,
      bedrooms, furnishing_status,
      search, page = 1, limit = 20,
      sort_by = 'created_at', sort_order = 'DESC'
    } = req.query;

    const conditions = ['p.is_active = true'];
    const params = [];
    let paramIndex = 1;

    if (district_id) {
      conditions.push(`p.district_id = $${paramIndex++}`);
      params.push(parseInt(district_id));
    }
    if (tehsil_id) {
      conditions.push(`p.tehsil_id = $${paramIndex++}`);
      params.push(parseInt(tehsil_id));
    }
    if (village_id) {
      conditions.push(`p.village_id = $${paramIndex++}`);
      params.push(parseInt(village_id));
    }
    if (property_type) {
      conditions.push(`p.property_type = $${paramIndex++}`);
      params.push(property_type);
    }
    if (listing_type) {
      conditions.push(`p.listing_type = $${paramIndex++}`);
      params.push(listing_type);
    }
    if (min_price) {
      conditions.push(`p.price >= $${paramIndex++}`);
      params.push(parseFloat(min_price));
    }
    if (max_price) {
      conditions.push(`p.price <= $${paramIndex++}`);
      params.push(parseFloat(max_price));
    }
    if (min_area) {
      conditions.push(`p.total_area >= $${paramIndex++}`);
      params.push(parseFloat(min_area));
    }
    if (max_area) {
      conditions.push(`p.total_area <= $${paramIndex++}`);
      params.push(parseFloat(max_area));
    }
    if (bedrooms) {
      conditions.push(`p.bedrooms >= $${paramIndex++}`);
      params.push(parseInt(bedrooms));
    }
    if (furnishing_status) {
      conditions.push(`p.furnishing_status = $${paramIndex++}`);
      params.push(furnishing_status);
    }
    if (search) {
      conditions.push(`(
        p.title ILIKE $${paramIndex} OR 
        p.description ILIKE $${paramIndex} OR 
        p.local_address ILIKE $${paramIndex}
      )`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    // Allowed sort columns
    const allowedSorts = ['created_at', 'price', 'total_area', 'title'];
    const sortColumn = allowedSorts.includes(sort_by) ? sort_by : 'created_at';
    const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Count total
    const countResult = await query(
      `SELECT COUNT(*) FROM properties p ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // Fetch properties with location details
    const result = await query(
      `SELECT p.*, d.district_name, t.tehsil_name, v.village_name, d.state_name
       FROM properties p
       JOIN districts d ON p.district_id = d.id
       JOIN tehsils t ON p.tehsil_id = t.id
       JOIN villages v ON p.village_id = v.id
       ${whereClause}
       ORDER BY p.${sortColumn} ${sortDirection}
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      success: true,
      count: result.rows.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch properties' });
  }
};

// Get single property by ID
const getProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT p.*, d.district_name, t.tehsil_name, v.village_name, d.state_name
       FROM properties p
       JOIN districts d ON p.district_id = d.id
       JOIN tehsils t ON p.tehsil_id = t.id
       JOIN villages v ON p.village_id = v.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }

    // Increment view count
    await query('UPDATE properties SET view_count = view_count + 1 WHERE id = $1', [id]);

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch property' });
  }
};

// Update property
const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if property exists
    const existing = await query('SELECT id FROM properties WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }

    // Build dynamic update query
    const allowedFields = [
      'title', 'description', 'price', 'is_price_negotiable',
      'status', 'property_type', 'listing_type',
      'total_area', 'area_unit', 'built_up_area', 'carpet_area',
      'bedrooms', 'bathrooms', 'balconies', 'furnishing_status',
      'local_address', 'full_address', 'pincode',
      'latitude', 'longitude',
      'owner_name', 'owner_phone', 'owner_email', 'is_owner',
      'amenities', 'is_featured', 'is_active'
    ];

    const setClauses = [];
    const params = [id];
    let paramIndex = 2;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        if (key === 'amenities') {
          setClauses.push(`${key} = $${paramIndex++}::jsonb`);
          params.push(JSON.stringify(value));
        } else {
          setClauses.push(`${key} = $${paramIndex++}`);
          params.push(value);
        }
      }
    }

    if (setClauses.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid fields to update' });
    }

    setClauses.push(`updated_by = $${paramIndex++}`);
    params.push(req.user?.username || 'anonymous');

    const result = await query(
      `UPDATE properties SET ${setClauses.join(', ')} WHERE id = $1 RETURNING *`,
      params
    );

    res.json({
      success: true,
      message: 'Property updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({ success: false, error: 'Failed to update property' });
  }
};

// Delete property (soft delete)
const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `UPDATE properties SET is_active = false, updated_by = $2 WHERE id = $1 RETURNING id`,
      [id, req.user?.username || 'anonymous']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }

    res.json({ success: true, message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ success: false, error: 'Failed to delete property' });
  }
};

// Get featured properties
const getFeaturedProperties = async (req, res) => {
  try {
    const result = await query(
      `SELECT p.*, d.district_name, t.tehsil_name, v.village_name
       FROM properties p
       JOIN districts d ON p.district_id = d.id
       JOIN tehsils t ON p.tehsil_id = t.id
       JOIN villages v ON p.village_id = v.id
       WHERE p.is_featured = true AND p.is_active = true
       ORDER BY p.created_at DESC
       LIMIT 10`
    );
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    console.error('Error fetching featured properties:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch featured properties' });
  }
};

// Get property statistics
const getPropertyStats = async (req, res) => {
  try {
    const stats = await query(`
      SELECT 
        COUNT(*)::int as total_properties,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int as new_this_week,
        COUNT(*) FILTER (WHERE property_type = 'land_plot')::int as land_plots,
        COUNT(*) FILTER (WHERE property_type = 'residential_house')::int as houses,
        COUNT(*) FILTER (WHERE property_type = 'apartment_flat')::int as apartments,
        COUNT(*) FILTER (WHERE listing_type = 'sell')::int as for_sale,
        COUNT(*) FILTER (WHERE listing_type = 'rent')::int as for_rent,
        ROUND(AVG(price)::numeric, 2)::float as avg_price,
        MIN(price)::float as min_price,
        MAX(price)::float as max_price
      FROM properties WHERE is_active = true
    `);

    res.json({ success: true, data: stats.rows[0] });
  } catch (error) {
    console.error('Error fetching property stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch statistics' });
  }
};

// Upload property images
const uploadImages = async (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, error: 'No images uploaded' });
    }

    // Check property exists
    const property = await query('SELECT id, images FROM properties WHERE id = $1', [id]);
    if (property.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }

    const imageUrls = files.map((file, index) => ({
      url: `/uploads/properties/${file.filename}`,
      is_primary: index === 0 && (!property.rows[0].images || property.rows[0].images.length === 0),
      sort_order: index
    }));

    // Store image metadata in property_images table
    for (const img of imageUrls) {
      await query(
        `INSERT INTO property_images (property_id, image_url, is_primary, sort_order) VALUES ($1, $2, $3, $4)`,
        [id, img.url, img.is_primary, img.sort_order]
      );
    }

    // Update property images JSON field
    const existingImages = property.rows[0].images || [];
    const updatedImages = [...existingImages, ...imageUrls];
    await query('UPDATE properties SET images = $1::jsonb WHERE id = $2', [JSON.stringify(updatedImages), id]);

    res.json({
      success: true,
      message: `${files.length} image(s) uploaded successfully`,
      data: imageUrls
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ success: false, error: 'Failed to upload images' });
  }
};

module.exports = {
  createProperty,
  getProperties,
  getProperty,
  updateProperty,
  deleteProperty,
  getFeaturedProperties,
  getPropertyStats,
  uploadImages,
};