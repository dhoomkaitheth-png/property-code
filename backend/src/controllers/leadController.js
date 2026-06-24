const { query } = require('../config/database');

// Create a lead (buyer interested in property)
const createLead = async (req, res) => {
  try {
    const { property_id, message, preferred_contact_method, preferred_visit_date } = req.body;

    if (!property_id) {
      return res.status(400).json({ success: false, error: 'Property ID is required' });
    }

    // Get property to find seller
    const property = await query('SELECT id, owner_phone, owner_name, created_by FROM properties WHERE id = $1 AND is_active = true', [property_id]);
    if (property.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }

    // Check for existing lead from same buyer
    const existing = await query(
      'SELECT id FROM leads WHERE buyer_id = $1 AND property_id = $2 AND status != \'closed\' AND status != \'not_interested\'',
      [req.user.id, property_id]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, error: 'You have already contacted the owner about this property' });
    }

    const result = await query(
      `INSERT INTO leads (buyer_id, property_id, message, preferred_contact_method, preferred_visit_date)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.id, property_id, message || null, preferred_contact_method || 'phone', preferred_visit_date || null]
    );

    // Create notification for property owner if they're a registered user
    if (property.rows[0].created_by) {
      const ownerResult = await query(
        'SELECT id FROM users WHERE email = $1 OR name = $2',
        [property.rows[0].created_by, property.rows[0].owner_name]
      );
      if (ownerResult.rows.length > 0) {
        const buyerInfo = await query('SELECT name FROM users WHERE id = $1', [req.user.id]);
        const buyerName = buyerInfo.rows[0]?.name || 'A buyer';
        await query(
          `INSERT INTO notifications (user_id, title, body, type, reference_type, reference_id)
           VALUES ($1, $2, $3, 'lead', 'property', $4)`,
          [ownerResult.rows[0].id, 'New Lead!', `${buyerName} is interested in your property`, property_id]
        );
      }
    }

    res.status(201).json({
      success: true,
      message: 'Interest registered successfully. The owner will contact you soon.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({ success: false, error: 'Failed to create lead' });
  }
};

// Get leads for a seller (properties they own)
const getSellerLeads = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status;

    let whereClause = '(p.owner_phone = $1 OR p.created_by = $2)';
    const params = [''];
    let paramIndex = 3;

    // We need owner info - use a subquery to find properties owned by this user
    const userResult = await query('SELECT name, email, mobile FROM users WHERE id = $1', [req.user.id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    const user = userResult.rows[0];
    params[0] = user.mobile;
    params[1] = user.email || user.name;

    if (status) {
      whereClause += ` AND l.status = $${paramIndex++}`;
      params.push(status);
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM leads l
       JOIN properties p ON l.property_id = p.id
       WHERE ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    params.push(limit, offset);
    const result = await query(
      `SELECT l.*, p.title as property_title, p.price, p.property_type,
              d.district_name, t.tehsil_name, v.village_name,
              u.name as buyer_name, u.email as buyer_email, u.mobile as buyer_mobile
       FROM leads l
       JOIN properties p ON l.property_id = p.id
       JOIN districts d ON p.district_id = d.id
       JOIN tehsils t ON p.tehsil_id = t.id
       JOIN villages v ON p.village_id = v.id
       JOIN users u ON l.buyer_id = u.id
       WHERE ${whereClause}
       ORDER BY l.created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      params
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
    console.error('Get seller leads error:', error);
    res.status(500).json({ success: false, error: 'Failed to get leads' });
  }
};

// Get leads for a buyer (properties they inquired about)
const getBuyerLeads = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const countResult = await query(
      'SELECT COUNT(*) FROM leads WHERE buyer_id = $1',
      [req.user.id]
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await query(
      `SELECT l.*, p.title as property_title, p.price, p.property_type,
              d.district_name, t.tehsil_name, v.village_name,
              p.owner_name, p.owner_phone, p.owner_email
       FROM leads l
       JOIN properties p ON l.property_id = p.id
       JOIN districts d ON p.district_id = d.id
       JOIN tehsils t ON p.tehsil_id = t.id
       JOIN villages v ON p.village_id = v.id
       WHERE l.buyer_id = $1
       ORDER BY l.created_at DESC
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
    console.error('Get buyer leads error:', error);
    res.status(500).json({ success: false, error: 'Failed to get leads' });
  }
};

// Update lead status
const updateLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['new', 'contacted', 'interested', 'visit_scheduled', 'negotiating', 'converted', 'closed', 'not_interested'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const result = await query(
      `UPDATE leads SET status = $1, notes = COALESCE($2, notes) WHERE id = $3 RETURNING *`,
      [status, notes || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    res.json({ success: true, message: 'Lead status updated', data: result.rows[0] });
  } catch (error) {
    console.error('Update lead status error:', error);
    res.status(500).json({ success: false, error: 'Failed to update lead status' });
  }
};

module.exports = { createLead, getSellerLeads, getBuyerLeads, updateLeadStatus };