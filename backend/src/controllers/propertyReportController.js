const { query } = require('../config/database');

// Report a property
const reportProperty = async (req, res) => {
  try {
    const { property_id, report_reason, description, reporter_name, reporter_email, reporter_phone } = req.body;

    if (!property_id || !report_reason) {
      return res.status(400).json({ success: false, error: 'Property ID and reason are required' });
    }

    const result = await query(
      `INSERT INTO property_reports (property_id, reporter_id, reporter_name, reporter_email, reporter_phone, report_reason, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [property_id, req.user?.id || null, reporter_name || null, reporter_email || null, 
       reporter_phone || null, report_reason, description || null]
    );

    res.status(201).json({
      success: true,
      message: 'Property reported. Our team will review it shortly.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Report property error:', error);
    res.status(500).json({ success: false, error: 'Failed to submit report' });
  }
};

// Admin: Get all reports
const getReports = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (status) {
      conditions.push(`pr.status = $${paramIndex++}`);
      params.push(status);
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const countResult = await query(`SELECT COUNT(*) FROM property_reports pr ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);

    const result = await query(
      `SELECT pr.*, p.title as property_title, p.district_id, d.district_name
       FROM property_reports pr
       JOIN properties p ON pr.property_id = p.id
       JOIN districts d ON p.district_id = d.id
       ${whereClause}
       ORDER BY pr.created_at DESC
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
    console.error('Get reports error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch reports' });
  }
};

// Admin: Update report status
const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    const validStatuses = ['pending', 'reviewing', 'resolved', 'dismissed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const result = await query(
      `UPDATE property_reports SET status = $2, admin_notes = $3, resolved_by = $4
       WHERE id = $1 RETURNING *`,
      [id, status, admin_notes || null, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    // If resolved, mark property as inactive
    if (status === 'resolved') {
      await query('UPDATE properties SET is_active = false WHERE id = $1', [result.rows[0].property_id]);
    }

    res.json({ success: true, message: `Report ${status}`, data: result.rows[0] });
  } catch (error) {
    console.error('Update report status error:', error);
    res.status(500).json({ success: false, error: 'Failed to update report' });
  }
};

module.exports = { reportProperty, getReports, updateReportStatus };