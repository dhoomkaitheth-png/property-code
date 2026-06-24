const { query } = require('../config/database');

// Home page
const homePage = async (req, res) => {
  try {
    const [districts, featuredProperties, recentProperties, stats] = await Promise.all([
      query('SELECT id, district_name FROM districts ORDER BY district_name'),
      query(`SELECT p.*, d.district_name, t.tehsil_name, v.village_name 
             FROM properties p JOIN districts d ON p.district_id = d.id 
             JOIN tehsils t ON p.tehsil_id = t.id JOIN villages v ON p.village_id = v.id 
             WHERE p.is_featured = true AND p.is_active = true ORDER BY p.created_at DESC LIMIT 6`),
      query(`SELECT p.*, d.district_name, t.tehsil_name, v.village_name 
             FROM properties p JOIN districts d ON p.district_id = d.id 
             JOIN tehsils t ON p.tehsil_id = t.id JOIN villages v ON p.village_id = v.id 
             WHERE p.is_active = true ORDER BY p.created_at DESC LIMIT 6`),
      query(`SELECT COUNT(*)::int as total_properties, 
             COUNT(*) FILTER (WHERE listing_type = 'sell')::int as for_sale,
             COUNT(*) FILTER (WHERE listing_type = 'rent')::int as for_rent
             FROM properties WHERE is_active = true`)
    ]);

    res.render('index.ejs', {
      title: 'Uttarakhand Real Estate - Find Properties in Uttarakhand',
      districts: districts.rows,
      featured_properties: featuredProperties.rows,
      recent_properties: recentProperties.rows,
      stats: { ...stats.rows[0], total_districts: districts.rows.length },
      now: new Date()
    });
  } catch (error) {
    console.error('Home page error:', error);
    res.status(500).send('Server error');
  }
};

// Properties listing page
const propertiesPage = async (req, res) => {
  try {
    const districts = await query('SELECT id, district_name FROM districts ORDER BY district_name');
    
    // Pass query params to template
    const filters = {
      district_id: req.query.district_id || '',
      tehsil_id: req.query.tehsil_id || '',
      property_type: req.query.property_type || '',
      listing_type: req.query.listing_type || '',
      min_price: req.query.min_price || '',
      max_price: req.query.max_price || '',
      bedrooms: req.query.bedrooms || '',
      search: req.query.search || ''
    };

    res.render('properties.ejs', {
      districts: districts.rows,
      filters: filters,
      now: new Date()
    });
  } catch (error) {
    console.error('Properties page error:', error);
    res.status(500).send('Server error');
  }
};

// Property detail page
const propertyDetailPage = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT p.*, d.district_name, t.tehsil_name, v.village_name, d.state_name
       FROM properties p
       JOIN districts d ON p.district_id = d.id
       JOIN tehsils t ON p.tehsil_id = t.id
       JOIN villages v ON p.village_id = v.id
       WHERE p.id = $1 AND p.is_active = true`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).send('Property not found');
    }

    // Increment view count
    await query('UPDATE properties SET view_count = view_count + 1 WHERE id = $1', [id]);

    res.render('property_detail.ejs', { 
      property: result.rows[0],
      now: new Date()
    });
  } catch (error) {
    console.error('Property detail error:', error);
    res.status(500).send('Server error');
  }
};

// Login page
const loginPage = (req, res) => {
  res.render('auth/login.ejs', { now: new Date() });
};

// Register page
const registerPage = (req, res) => {
  res.render('auth/register.ejs', { now: new Date() });
};

// Forgot password page
const forgotPasswordPage = (req, res) => {
  res.render('auth/forgot_password.ejs', { now: new Date() });
};

// Reset password page
const resetPasswordPage = async (req, res) => {
  try {
    const { token } = req.params;
    const result = await query(
      'SELECT id FROM password_reset_tokens WHERE token = $1 AND is_used = false AND expires_at > CURRENT_TIMESTAMP',
      [token]
    );
    res.render('auth/reset_password.ejs', { 
      token, 
      valid: result.rows.length > 0,
      now: new Date() 
    });
  } catch (error) {
    res.status(500).send('Server error');
  }
};

// Dashboard page
const dashboardPage = async (req, res) => {
  try {
    const token = req.headers.cookie?.split(';').find(c => c.trim().startsWith('token='));
    if (!token) {
      return res.redirect('/auth/login');
    }
    res.render('dashboard/index.ejs', { now: new Date() });
  } catch (error) {
    res.status(500).send('Server error');
  }
};

// Seller dashboard pages
const myPropertiesPage = (req, res) => {
  res.render('dashboard/my_properties.ejs', { now: new Date() });
};

const addPropertyPage = async (req, res) => {
  try {
    const districts = await query('SELECT id, district_name FROM districts ORDER BY district_name');
    const amenities = await query('SELECT id, name, icon, category FROM amenities WHERE is_active = true ORDER BY sort_order');
    res.render('dashboard/add_property.ejs', { 
      districts: districts.rows, 
      amenities: amenities.rows,
      now: new Date() 
    });
  } catch (error) {
    res.status(500).send('Server error');
  }
};

const editPropertyPage = async (req, res) => {
  try {
    const { id } = req.params;
    const [property, districts, amenities] = await Promise.all([
      query('SELECT * FROM properties WHERE id = $1', [id]),
      query('SELECT id, district_name FROM districts ORDER BY district_name'),
      query('SELECT id, name, icon, category FROM amenities WHERE is_active = true ORDER BY sort_order')
    ]);
    if (property.rows.length === 0) return res.status(404).send('Property not found');
    res.render('dashboard/edit_property.ejs', { 
      property: property.rows[0], 
      districts: districts.rows, 
      amenities: amenities.rows,
      now: new Date() 
    });
  } catch (error) {
    res.status(500).send('Server error');
  }
};

const leadsPage = (req, res) => {
  res.render('dashboard/leads.ejs', { now: new Date() });
};

const favoritesPage = (req, res) => {
  res.render('dashboard/favorites.ejs', { now: new Date() });
};

const messagesPage = (req, res) => {
  res.render('dashboard/messages.ejs', { now: new Date() });
};

const profilePage = (req, res) => {
  res.render('dashboard/profile.ejs', { now: new Date() });
};

const subscriptionsPage = async (req, res) => {
  try {
    const plans = await query('SELECT * FROM premium_plans WHERE is_active = true ORDER BY sort_order');
    res.render('dashboard/subscriptions.ejs', { plans: plans.rows, now: new Date() });
  } catch (error) {
    res.status(500).send('Server error');
  }
};

// Admin pages
const adminPage = async (req, res) => {
  try {
    res.render('admin/index.ejs', { now: new Date() });
  } catch (error) {
    res.status(500).send('Server error');
  }
};

const adminUsersPage = (req, res) => {
  res.render('admin/users.ejs', { now: new Date() });
};

const adminPropertiesPage = (req, res) => {
  res.render('admin/properties.ejs', { now: new Date() });
};

const adminLocationsPage = (req, res) => {
  res.render('admin/locations.ejs', { now: new Date() });
};

const adminBlogsPage = async (req, res) => {
  res.render('admin/blogs.ejs', { now: new Date() });
};

const adminPaymentsPage = (req, res) => {
  res.render('admin/payments.ejs', { now: new Date() });
};

const adminReportsPage = (req, res) => {
  res.render('admin/reports.ejs', { now: new Date() });
};

const adminEnquiriesPage = (req, res) => {
  res.render('admin/enquiries.ejs', { now: new Date() });
};

// Chat page
const chatPage = (req, res) => {
  const propertyId = req.query.property || '';
  res.render('chat.ejs', { property_id: propertyId, now: new Date() });
};

// Blog pages
const blogsPage = async (req, res) => {
  try {
    const categories = await query(
      'SELECT category, COUNT(*)::int as count FROM blogs WHERE is_published = true GROUP BY category'
    );
    res.render('blogs/list.ejs', { categories: categories.rows, now: new Date() });
  } catch (error) {
    res.status(500).send('Server error');
  }
};

const blogDetailPage = async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await query('SELECT * FROM blogs WHERE slug = $1 AND is_published = true', [slug]);
    if (result.rows.length === 0) return res.status(404).send('Blog not found');
    await query('UPDATE blogs SET view_count = view_count + 1 WHERE id = $1', [result.rows[0].id]);
    res.render('blogs/detail.ejs', { blog: result.rows[0], now: new Date() });
  } catch (error) {
    res.status(500).send('Server error');
  }
};

// Contact page
const contactPage = (req, res) => {
  res.render('contact.ejs', { now: new Date() });
};

module.exports = {
  homePage, propertiesPage, propertyDetailPage,
  loginPage, registerPage, forgotPasswordPage, resetPasswordPage,
  dashboardPage, myPropertiesPage, addPropertyPage, editPropertyPage,
  leadsPage, favoritesPage, messagesPage, profilePage, subscriptionsPage,
  adminPage, adminUsersPage, adminPropertiesPage, adminLocationsPage,
  adminBlogsPage, adminPaymentsPage, adminReportsPage, adminEnquiriesPage,
  chatPage, blogsPage, blogDetailPage, contactPage
};