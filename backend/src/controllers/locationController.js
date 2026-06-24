const { query } = require('../config/database');

// Get all districts (Uttarakhand only)
const getDistricts = async (req, res) => {
  try {
    const result = await query(
      'SELECT id, district_name, state_name FROM districts ORDER BY district_name'
    );
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching districts:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch districts' });
  }
};

// Get tehsils by district ID
const getTehsilsByDistrict = async (req, res) => {
  try {
    const { districtId } = req.params;
    const result = await query(
      'SELECT id, district_id, tehsil_name FROM tehsils WHERE district_id = $1 ORDER BY tehsil_name',
      [districtId]
    );
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching tehsils:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch tehsils' });
  }
};

// Get villages by tehsil ID
const getVillagesByTehsil = async (req, res) => {
  try {
    const { tehsilId } = req.params;
    const result = await query(
      `SELECT v.id, v.tehsil_id, v.village_name, v.district_id, t.tehsil_name 
       FROM villages v 
       JOIN tehsils t ON v.tehsil_id = t.id 
       WHERE v.tehsil_id = $1 
       ORDER BY v.village_name`,
      [tehsilId]
    );
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching villages:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch villages' });
  }
};

// Get all villages by district ID
const getVillagesByDistrict = async (req, res) => {
  try {
    const { districtId } = req.params;
    const result = await query(
      `SELECT v.id, v.tehsil_id, v.village_name, t.tehsil_name 
       FROM villages v 
       JOIN tehsils t ON v.tehsil_id = t.id 
       WHERE v.district_id = $1 
       ORDER BY t.tehsil_name, v.village_name`,
      [districtId]
    );
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching villages by district:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch villages' });
  }
};

// Get single district
const getDistrict = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT id, district_name, state_name FROM districts WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'District not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching district:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch district' });
  }
};

// Get single tehsil
const getTehsil = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT t.id, t.district_id, t.tehsil_name, d.district_name 
       FROM tehsils t JOIN districts d ON t.district_id = d.id 
       WHERE t.id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Tehsil not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching tehsil:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch tehsil' });
  }
};

// Get single village
const getVillage = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT v.id, v.district_id, v.tehsil_id, v.village_name, t.tehsil_name, d.district_name
       FROM villages v 
       JOIN tehsils t ON v.tehsil_id = t.id 
       JOIN districts d ON v.district_id = d.id
       WHERE v.id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Village not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching village:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch village' });
  }
};

// Search locations (for autocomplete)
const searchLocations = async (req, res) => {
  try {
    const { query: searchTerm, type } = req.query;

    if (!searchTerm || searchTerm.length < 2) {
      return res.json({ success: true, data: { districts: [], tehsils: [], villages: [] } });
    }

    const searchPattern = `%${searchTerm}%`;
    let results = { districts: [], tehsils: [], villages: [] };

    if (!type || type === 'district') {
      const districts = await query(
        'SELECT id, district_name, state_name FROM districts WHERE district_name ILIKE $1 LIMIT 10',
        [searchPattern]
      );
      results.districts = districts.rows;
    }

    if (!type || type === 'tehsil') {
      const tehsils = await query(
        `SELECT t.id, t.tehsil_name, d.district_name 
         FROM tehsils t JOIN districts d ON t.district_id = d.id 
         WHERE t.tehsil_name ILIKE $1 LIMIT 10`,
        [searchPattern]
      );
      results.tehsils = tehsils.rows;
    }

    if (!type || type === 'village') {
      const villages = await query(
        `SELECT v.id, v.village_name, t.tehsil_name, d.district_name 
         FROM villages v 
         JOIN tehsils t ON v.tehsil_id = t.id 
         JOIN districts d ON v.district_id = d.id 
         WHERE v.village_name ILIKE $1 LIMIT 10`,
        [searchPattern]
      );
      results.villages = villages.rows;
    }

    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Error searching locations:', error);
    res.status(500).json({ success: false, error: 'Search failed' });
  }
};

module.exports = {
  getDistricts,
  getTehsilsByDistrict,
  getVillagesByTehsil,
  getVillagesByDistrict,
  getDistrict,
  getTehsil,
  getVillage,
  searchLocations,
};