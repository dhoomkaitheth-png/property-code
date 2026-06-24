const { query } = require('../config/database');

// Submit contact enquiry
const createEnquiry = async (req, res) => {
  try {
    const { name, email, mobile, subject, message, property_id } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'Name, email and message are required' });
    }

    const result = await query(
      `INSERT INTO contact_enquiries (name, email, mobile, subject, message, property_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, email, mobile || null, subject || null, message, property_id || null]
    );

    res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create enquiry error:', error);
    res.status(500).json({ success: false, error: 'Failed to submit enquiry' });
  }
};

// Admin: Get all enquiries
const getEnquiries = async (req, res) => {
  try {
    const { is_read, page = 1, limit = 20 } = req.query;
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (is_read !== undefined) {
      conditions.push(`is_read = $${paramIndex++}`);
      params.push(is_read === 'true');
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const countResult = await query(`SELECT COUNT(*) FROM contact_enquiries ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);

    const result = await query(
      `SELECT ce.*, p.title as property_title
       FROM contact_enquiries ce
       LEFT JOIN properties p ON ce.property_id = p.id
       ${whereClause}
       ORDER BY ce.created_at DESC
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
    console.error('Get enquiries error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch enquiries' });
  }
};

// Admin: Mark enquiry as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      'UPDATE contact_enquiries SET is_read = true, read_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Enquiry not found' });
    }
    res.json({ success: true, message: 'Enquiry marked as read', data: result.rows[0] });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ success: false, error: 'Failed to update enquiry' });
  }
};

// Admin: Delete enquiry
const deleteEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM contact_enquiries WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Enquiry not found' });
    }
    res.json({ success: true, message: 'Enquiry deleted' });
  } catch (error) {
    console.error('Delete enquiry error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete enquiry' });
  }
};

module.exports = { createEnquiry, getEnquiries, markAsRead, deleteEnquiry };