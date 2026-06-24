const { query } = require('../config/database');

// Get admin dashboard analytics
const getAdminAnalytics = async (req, res) => {
  try {
    const [propertyStats, userStats, leadStats, viewStats] = await Promise.all([
      // Property statistics
      query(`
        SELECT 
          COUNT(*)::int as total,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int as last_7_days,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int as last_30_days,
          COUNT(*) FILTER (WHERE status = 'available')::int as available,
          COUNT(*) FILTER (WHERE status = 'sold')::int as sold,
          COUNT(*) FILTER (WHERE status = 'rented')::int as rented,
          COUNT(*) FILTER (WHERE is_featured = true)::int as featured,
          ROUND(AVG(price)::numeric, 2)::float as avg_price,
          SUM(view_count)::int as total_views
        FROM properties WHERE is_active = true
      `),

      // User statistics
      query(`
        SELECT 
          COUNT(*)::int as total,
          COUNT(*) FILTER (WHERE role = 'buyer')::int as buyers,
          COUNT(*) FILTER (WHERE role = 'seller')::int as sellers,
          COUNT(*) FILTER (WHERE role = 'agent')::int as agents,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int as new_last_30_days,
          COUNT(*) FILTER (WHERE is_verified = true)::int as verified
        FROM users WHERE is_active = true
      `),

      // Lead statistics
      query(`
        SELECT 
          COUNT(*)::int as total,
          COUNT(*) FILTER (WHERE status = 'new')::int as new_leads,
          COUNT(*) FILTER (WHERE status = 'converted')::int as converted,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int as last_30_days
        FROM leads
      `),

      // View statistics
      query(`
        SELECT 
          COUNT(*)::int as total_views,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int as views_last_7_days,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int as views_last_30_days,
          COUNT(DISTINCT property_id)::int as unique_properties_viewed
        FROM property_views
      `)
    ]);

    res.json({
      success: true,
      data: {
        properties: propertyStats.rows[0],
        users: userStats.rows[0],
        leads: leadStats.rows[0],
        views: viewStats.rows[0]
      }
    });
  } catch (error) {
    console.error('Get admin analytics error:', error);
    res.status(500).json({ success: false, error: 'Failed to get analytics' });
  }
};

// Get property type distribution
const getPropertyTypeDistribution = async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        property_type,
        COUNT(*)::int as count,
        ROUND(AVG(price)::numeric, 2)::float as avg_price,
        MIN(price)::float as min_price,
        MAX(price)::float as max_price
      FROM properties 
      WHERE is_active = true
      GROUP BY property_type
      ORDER BY count DESC
    `);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get property type distribution error:', error);
    res.status(500).json({ success: false, error: 'Failed to get distribution' });
  }
};

// Get district wise property count
const getDistrictWiseStats = async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        d.id,
        d.district_name,
        COUNT(p.id)::int as property_count,
        ROUND(AVG(p.price)::numeric, 2)::float as avg_price,
        MIN(p.price)::float as min_price,
        MAX(p.price)::float as max_price,
        COUNT(*) FILTER (WHERE p.listing_type = 'sell')::int as for_sale,
        COUNT(*) FILTER (WHERE p.listing_type = 'rent')::int as for_rent
      FROM districts d
      LEFT JOIN properties p ON d.id = p.district_id AND p.is_active = true
      GROUP BY d.id, d.district_name
      ORDER BY property_count DESC
    `);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get district stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to get district stats' });
  }
};

// Get monthly trends (last 12 months)
const getMonthlyTrends = async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        DATE_TRUNC('month', created_at)::date as month,
        COUNT(*)::int as property_count,
        COUNT(*) FILTER (WHERE listing_type = 'sell')::int as sales,
        COUNT(*) FILTER (WHERE listing_type = 'rent')::int as rentals,
        ROUND(AVG(price)::numeric, 2)::float as avg_price,
        SUM(view_count)::int as total_views
      FROM properties
      WHERE created_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
    `);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get monthly trends error:', error);
    res.status(500).json({ success: false, error: 'Failed to get trends' });
  }
};

// Get user registration trends
const getUserRegistrationTrends = async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        DATE_TRUNC('month', created_at)::date as month,
        COUNT(*)::int as total,
        COUNT(*) FILTER (WHERE role = 'buyer')::int as buyers,
        COUNT(*) FILTER (WHERE role = 'seller')::int as sellers,
        COUNT(*) FILTER (WHERE role = 'agent')::int as agents
      FROM users
      WHERE created_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
    `);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get user trends error:', error);
    res.status(500).json({ success: false, error: 'Failed to get user trends' });
  }
};

// Get revenue analytics
const getRevenueAnalytics = async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        DATE_TRUNC('month', paid_at)::date as month,
        COUNT(*)::int as transaction_count,
        SUM(amount)::float as revenue,
        ROUND(AVG(amount)::numeric, 2)::float as avg_transaction_value
      FROM payments
      WHERE payment_status = 'success' AND paid_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', paid_at)
      ORDER BY month DESC
    `);

    // Get totals
    const totals = await query(`
      SELECT 
        COUNT(*)::int as total_transactions,
        SUM(amount)::float as total_revenue,
        COUNT(DISTINCT user_id)::int as paying_users
      FROM payments WHERE payment_status = 'success'
    `);

    res.json({
      success: true,
      data: {
        monthly: result.rows,
        totals: totals.rows[0]
      }
    });
  } catch (error) {
    console.error('Get revenue analytics error:', error);
    res.status(500).json({ success: false, error: 'Failed to get revenue analytics' });
  }
};

// Get search analytics
const getSearchAnalytics = async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        search_query,
        COUNT(*)::int as search_count,
        ROUND(AVG(result_count)::numeric, 2)::float as avg_results,
        MAX(created_at)::date as last_searched
      FROM search_history
      WHERE search_query IS NOT NULL AND search_query != ''
      GROUP BY search_query
      ORDER BY search_count DESC
      LIMIT 20
    `);

    const totalSearches = await query('SELECT COUNT(*)::int as total FROM search_history');

    res.json({
      success: true,
      data: {
        top_searches: result.rows,
        total_searches: totalSearches.rows[0].total
      }
    });
  } catch (error) {
    console.error('Get search analytics error:', error);
    res.status(500).json({ success: false, error: 'Failed to get search analytics' });
  }
};

// Get seller dashboard stats
const getSellerAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await query(`
      SELECT 
        COUNT(DISTINCT p.id)::int as total_properties,
        COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'available')::int as active_listings,
        COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'sold')::int as sold,
        COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'rented')::int as rented,
        SUM(p.view_count)::int as total_views,
        COUNT(DISTINCT l.id)::int as total_leads,
        COUNT(DISTINCT l.id) FILTER (WHERE l.status = 'new')::int as new_leads,
        COUNT(DISTINCT l.id) FILTER (WHERE l.created_at >= NOW() - INTERVAL '30 days')::int as leads_last_30_days,
        COUNT(DISTINCT f.id)::int as total_favorites
      FROM users u
      LEFT JOIN properties p ON (p.created_by = u.id::text OR p.owner_email = u.email)
      LEFT JOIN leads l ON l.property_id = p.id
      LEFT JOIN favorites f ON f.property_id = p.id
      WHERE u.id = $1
      GROUP BY u.id
    `, [userId]);

    res.json({ success: true, data: result.rows[0] || {} });
  } catch (error) {
    console.error('Get seller analytics error:', error);
    res.status(500).json({ success: false, error: 'Failed to get seller analytics' });
  }
};

module.exports = {
  getAdminAnalytics,
  getPropertyTypeDistribution,
  getDistrictWiseStats,
  getMonthlyTrends,
  getUserRegistrationTrends,
  getRevenueAnalytics,
  getSearchAnalytics,
  getSellerAnalytics
};