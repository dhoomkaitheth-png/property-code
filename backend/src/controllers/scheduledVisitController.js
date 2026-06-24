const { query } = require('../config/database');

// Schedule a visit
const scheduleVisit = async (req, res) => {
  try {
    const { property_id, visit_date, visit_time, duration_minutes, visitor_message } = req.body;
    const visitor_id = req.user.id;

    if (!property_id || !visit_date || !visit_time) {
      return res.status(400).json({ success: false, error: 'Property, date and time are required' });
    }

    // Check property exists
    const property = await query('SELECT id, owner_name, owner_phone, owner_email, created_by FROM properties WHERE id = $1 AND is_active = true', [property_id]);
    if (property.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }

    // Find owner_id
    const ownerResult = await query(
      'SELECT id FROM users WHERE email = $1 OR mobile = $2',
      [property.rows[0].owner_email, property.rows[0].owner_phone]
    );
    const owner_id = ownerResult.rows[0]?.id || null;

    // Check for duplicate visit
    const existing = await query(
      `SELECT id FROM scheduled_visits 
       WHERE property_id = $1 AND visitor_id = $2 AND visit_date = $3 AND visit_time = $4 AND status NOT IN ('cancelled')`,
      [property_id, visitor_id, visit_date, visit_time]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, error: 'Visit already scheduled for this time' });
    }

    const result = await query(
      `INSERT INTO scheduled_visits (property_id, visitor_id, owner_id, visit_date, visit_time, duration_minutes, visitor_message)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [property_id, visitor_id, owner_id, visit_date, visit_time, duration_minutes || 30, visitor_message || null]
    );

    // Create notification for owner
    if (owner_id) {
      await query(
        `INSERT INTO notifications (user_id, title, body, type, reference_type, reference_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [owner_id, 'New Visit Scheduled', `A visit has been scheduled for ${visit_date} at ${visit_time}`, 'lead', 'scheduled_visit', result.rows[0].id.toString()]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Visit scheduled successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Schedule visit error:', error);
    res.status(500).json({ success: false, error: 'Failed to schedule visit' });
  }
};

// Get visits for current user (as visitor)
const getMyVisits = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const conditions = ['visitor_id = $1'];
    const params = [req.user.id];
    let paramIndex = 2;

    if (status) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(status);
    }

    const whereClause = 'WHERE ' + conditions.join(' AND ');
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const countResult = await query(`SELECT COUNT(*) FROM scheduled_visits ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);

    const result = await query(
      `SELECT sv.*, p.title, p.property_type, p.price, p.images, 
              d.district_name, t.tehsil_name, v.village_name
       FROM scheduled_visits sv
       JOIN properties p ON sv.property_id = p.id
       JOIN districts d ON p.district_id = d.id
       JOIN tehsils t ON p.tehsil_id = t.id
       JOIN villages v ON p.village_id = v.id
       ${whereClause}
       ORDER BY sv.visit_date DESC, sv.visit_time DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      success: true,
      data: result.rows,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get my visits error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch visits' });
  }
};

// Get visits for a property (for owner)
const getPropertyVisits = async (req, res) => {
  try {
    const { property_id } = req.params;
    const result = await query(
      `SELECT sv.*, u.name as visitor_name, u.mobile as visitor_phone, u.email as visitor_email
       FROM scheduled_visits sv
       JOIN users u ON sv.visitor_id = u.id
       WHERE sv.property_id = $1 AND (sv.owner_id = $2 OR sv.visitor_id = $2)
       ORDER BY sv.visit_date DESC, sv.visit_time DESC`,
      [property_id, req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get property visits error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch visits' });
  }
};

// Update visit status
const updateVisitStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, owner_notes } = req.body;

    const validStatuses = ['confirmed', 'completed', 'cancelled', 'rescheduled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const setClauses = [`status = $2`];
    const params = [id, status];

    if (owner_notes) {
      setClauses.push(`owner_notes = $3`);
      params.push(owner_notes);
    }

    if (status === 'cancelled') {
      setClauses.push(`cancelled_by = $${params.length + 1}`);
      params.push('owner');
    }

    const result = await query(
      `UPDATE scheduled_visits SET ${setClauses.join(', ')} WHERE id = $1 RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Visit not found' });
    }

    res.json({ success: true, message: `Visit ${status}`, data: result.rows[0] });
  } catch (error) {
    console.error('Update visit status error:', error);
    res.status(500).json({ success: false, error: 'Failed to update visit' });
  }
};

// Cancel visit (visitor)
const cancelVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancellation_reason } = req.body;

    const result = await query(
      `UPDATE scheduled_visits SET status = 'cancelled', cancelled_by = 'visitor', cancellation_reason = $2 
       WHERE id = $1 AND visitor_id = $3 RETURNING *`,
      [id, cancellation_reason || null, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Visit not found or unauthorized' });
    }

    res.json({ success: true, message: 'Visit cancelled', data: result.rows[0] });
  } catch (error) {
    console.error('Cancel visit error:', error);
    res.status(500).json({ success: false, error: 'Failed to cancel visit' });
  }
};

module.exports = { scheduleVisit, getMyVisits, getPropertyVisits, updateVisitStatus, cancelVisit };