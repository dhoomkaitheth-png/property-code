const { query, getClient } = require('../config/database');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parse/sync');
const XLSX = require('xlsx');

// Import Districts from CSV/Excel
const importDistricts = async (req, res) => {
  let client;
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const rows = await parseFile(filePath);

    const requiredColumns = ['district_name'];
    const headers = Object.keys(rows[0] || {});
    if (!requiredColumns.every(col => headers.some(h => h.toLowerCase().includes(col)))) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ success: false, error: 'File must contain district_name column' });
    }

    client = await getClient();
    let successCount = 0;
    let failCount = 0;
    const errors = [];

    await client.query('BEGIN');

    for (let i = 0; i < rows.length; i++) {
      try {
        const districtName = rows[i].district_name || rows[i].District || rows[i].district || rows[i].DistrictName;
        if (!districtName || !districtName.trim()) {
          failCount++;
          errors.push({ row: i + 1, error: 'Empty district name' });
          continue;
        }
        await client.query(
          'INSERT INTO districts (district_name, state_name) VALUES ($1, $2) ON CONFLICT (district_name) DO UPDATE SET updated_at = CURRENT_TIMESTAMP',
          [districtName.trim(), 'Uttarakhand']
        );
        successCount++;
      } catch (err) {
        failCount++;
        errors.push({ row: i + 1, error: err.message });
      }
    }

    await client.query('COMMIT');

    // Log import
    await query(
      `INSERT INTO import_logs (import_type, file_name, total_rows, success_rows, failed_rows, errors, imported_by, status)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, 'completed')`,
      ['district', req.file.originalname, rows.length, successCount, failCount, JSON.stringify(errors), req.user?.username || 'admin']
    );

    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: `Imported ${successCount} districts. Failed: ${failCount}`,
      data: { total: rows.length, success: successCount, failed: failCount, errors }
    });
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error('Import districts error:', error);
    res.status(500).json({ success: false, error: 'Import failed', details: error.message });
  } finally {
    if (client) client.release();
  }
};

// Import Tehsils from CSV/Excel
const importTehsils = async (req, res) => {
  let client;
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const rows = await parseFile(filePath);

    client = await getClient();
    let successCount = 0;
    let failCount = 0;
    const errors = [];

    await client.query('BEGIN');

    for (let i = 0; i < rows.length; i++) {
      try {
        const districtName = rows[i].district_name || rows[i].District || rows[i].district;
        const tehsilName = rows[i].tehsil_name || rows[i].Tehsil || rows[i].tehsil;

        if (!districtName || !tehsilName) {
          failCount++;
          errors.push({ row: i + 1, error: 'Missing district_name or tehsil_name' });
          continue;
        }

        // Find district
        const districtResult = await client.query(
          'SELECT id FROM districts WHERE district_name ILIKE $1',
          [districtName.trim()]
        );

        if (districtResult.rows.length === 0) {
          failCount++;
          errors.push({ row: i + 1, error: `District '${districtName}' not found` });
          continue;
        }

        const districtId = districtResult.rows[0].id;
        await client.query(
          'INSERT INTO tehsils (district_id, tehsil_name) VALUES ($1, $2) ON CONFLICT (district_id, tehsil_name) DO UPDATE SET updated_at = CURRENT_TIMESTAMP',
          [districtId, tehsilName.trim()]
        );
        successCount++;
      } catch (err) {
        failCount++;
        errors.push({ row: i + 1, error: err.message });
      }
    }

    await client.query('COMMIT');

    await query(
      `INSERT INTO import_logs (import_type, file_name, total_rows, success_rows, failed_rows, errors, imported_by, status)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, 'completed')`,
      ['tehsil', req.file.originalname, rows.length, successCount, failCount, JSON.stringify(errors), req.user?.username || 'admin']
    );

    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: `Imported ${successCount} tehsils. Failed: ${failCount}`,
      data: { total: rows.length, success: successCount, failed: failCount, errors }
    });
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error('Import tehsils error:', error);
    res.status(500).json({ success: false, error: 'Import failed', details: error.message });
  } finally {
    if (client) client.release();
  }
};

// Import Villages from CSV/Excel
const importVillages = async (req, res) => {
  let client;
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const rows = await parseFile(filePath);

    client = await getClient();
    let successCount = 0;
    let failCount = 0;
    const errors = [];

    await client.query('BEGIN');

    for (let i = 0; i < rows.length; i++) {
      try {
        const districtName = rows[i].district_name || rows[i].District || rows[i].district;
        const tehsilName = rows[i].tehsil_name || rows[i].Tehsil || rows[i].tehsil;
        const villageName = rows[i].village_name || rows[i].Village || rows[i].village;

        if (!districtName || !tehsilName || !villageName) {
          failCount++;
          errors.push({ row: i + 1, error: 'Missing district_name, tehsil_name or village_name' });
          continue;
        }

        // Find district
        const districtResult = await client.query(
          'SELECT id FROM districts WHERE district_name ILIKE $1',
          [districtName.trim()]
        );
        if (districtResult.rows.length === 0) {
          failCount++;
          errors.push({ row: i + 1, error: `District '${districtName}' not found` });
          continue;
        }
        const districtId = districtResult.rows[0].id;

        // Find tehsil
        const tehsilResult = await client.query(
          'SELECT id FROM tehsils WHERE district_id = $1 AND tehsil_name ILIKE $2',
          [districtId, tehsilName.trim()]
        );
        if (tehsilResult.rows.length === 0) {
          failCount++;
          errors.push({ row: i + 1, error: `Tehsil '${tehsilName}' not found in district '${districtName}'` });
          continue;
        }
        const tehsilId = tehsilResult.rows[0].id;

        await client.query(
          `INSERT INTO villages (district_id, tehsil_id, village_name) 
           VALUES ($1, $2, $3) 
           ON CONFLICT (tehsil_id, village_name) DO UPDATE SET updated_at = CURRENT_TIMESTAMP`,
          [districtId, tehsilId, villageName.trim()]
        );
        successCount++;
      } catch (err) {
        failCount++;
        errors.push({ row: i + 1, error: err.message });
      }
    }

    await client.query('COMMIT');

    await query(
      `INSERT INTO import_logs (import_type, file_name, total_rows, success_rows, failed_rows, errors, imported_by, status)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, 'completed')`,
      ['village', req.file.originalname, rows.length, successCount, failCount, JSON.stringify(errors), req.user?.username || 'admin']
    );

    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: `Imported ${successCount} villages. Failed: ${failCount}`,
      data: { total: rows.length, success: successCount, failed: failCount, errors }
    });
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error('Import villages error:', error);
    res.status(500).json({ success: false, error: 'Import failed', details: error.message });
  } finally {
    if (client) client.release();
  }
};

// CRUD operations for villages (admin)
const createVillage = async (req, res) => {
  try {
    const { district_id, tehsil_id, village_name } = req.body;
    if (!district_id || !tehsil_id || !village_name) {
      return res.status(400).json({ success: false, error: 'district_id, tehsil_id and village_name are required' });
    }

    const result = await query(
      `INSERT INTO villages (district_id, tehsil_id, village_name) VALUES ($1, $2, $3) RETURNING *`,
      [district_id, tehsil_id, village_name.trim()]
    );

    res.status(201).json({ success: true, message: 'Village created', data: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ success: false, error: 'Village already exists in this tehsil' });
    }
    console.error('Error creating village:', error);
    res.status(500).json({ success: false, error: 'Failed to create village' });
  }
};

const updateVillage = async (req, res) => {
  try {
    const { id } = req.params;
    const { village_name, district_id, tehsil_id } = req.body;

    const result = await query(
      `UPDATE villages SET village_name = COALESCE($2, village_name), district_id = COALESCE($3, district_id), tehsil_id = COALESCE($4, tehsil_id) WHERE id = $1 RETURNING *`,
      [id, village_name?.trim(), district_id, tehsil_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Village not found' });
    }

    res.json({ success: true, message: 'Village updated', data: result.rows[0] });
  } catch (error) {
    console.error('Error updating village:', error);
    res.status(500).json({ success: false, error: 'Failed to update village' });
  }
};

const deleteVillage = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM villages WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Village not found' });
    }
    res.json({ success: true, message: 'Village deleted' });
  } catch (error) {
    console.error('Error deleting village:', error);
    res.status(500).json({ success: false, error: 'Failed to delete village' });
  }
};

// Admin login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const bcrypt = require('bcryptjs');
    const jwt = require('jsonwebtoken');

    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password are required' });
    }

    const result = await query(
      'SELECT id, username, email, password_hash, full_name, role, is_active FROM admin_users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    if (!user.is_active) {
      return res.status(401).json({ success: false, error: 'Account is deactivated' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Update last login
    await query('UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'uttarakhand_realestate_jwt_secret_key_2026',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          full_name: user.full_name,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
};

// Get import logs
const getImportLogs = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM import_logs ORDER BY started_at DESC LIMIT 50'
    );
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    console.error('Error fetching import logs:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch import logs' });
  }
};

// Get dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const stats = await query(`
      SELECT 
        (SELECT COUNT(*) FROM districts) as total_districts,
        (SELECT COUNT(*) FROM tehsils) as total_tehsils,
        (SELECT COUNT(*) FROM villages) as total_villages,
        (SELECT COUNT(*) FROM properties WHERE is_active = true) as total_properties,
        (SELECT COUNT(*) FROM properties WHERE created_at >= NOW() - INTERVAL '7 days') as new_properties_week,
        (SELECT COUNT(*) FROM import_logs WHERE created_at >= NOW() - INTERVAL '30 days') as imports_month
    `);
    res.json({ success: true, data: stats.rows[0] });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
};

// Helper: Parse CSV or Excel file
async function parseFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const fileBuffer = fs.readFileSync(filePath);

  if (ext === '.csv') {
    const content = fileBuffer.toString('utf-8');
    return csv.parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true
    });
  } else if (ext === '.xlsx' || ext === '.xls') {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(sheet, { defval: '' });
  } else {
    throw new Error('Unsupported file format. Please upload CSV or Excel file.');
  }
}

module.exports = {
  importDistricts,
  importTehsils,
  importVillages,
  createVillage,
  updateVillage,
  deleteVillage,
  login,
  getImportLogs,
  getDashboardStats,
};