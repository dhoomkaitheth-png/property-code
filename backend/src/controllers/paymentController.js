const { query, getClient } = require('../config/database');
const crypto = require('crypto');

// Create Razorpay order
const createOrder = async (req, res) => {
  try {
    const { plan_id } = req.body;
    
    if (!plan_id) {
      return res.status(400).json({ success: false, error: 'Plan ID is required' });
    }

    // Get plan details
    const planResult = await query('SELECT * FROM premium_plans WHERE id = $1 AND is_active = true', [plan_id]);
    if (planResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Plan not found' });
    }

    const plan = planResult.rows[0];

    // In production, integrate Razorpay SDK here
    // For now, return order details
    const orderId = 'order_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    res.json({
      success: true,
      data: {
        order_id: orderId,
        amount: plan.price * 100, // in paise
        currency: 'INR',
        plan: plan
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, error: 'Failed to create order' });
  }
};

// Verify payment
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan_id } = req.body;

    // In production, verify signature using Razorpay SDK
    // const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    //   .update(razorpay_order_id + '|' + razorpay_payment_id)
    //   .digest('hex');

    // For now, create subscription directly
    const planResult = await query('SELECT * FROM premium_plans WHERE id = $1', [plan_id]);
    if (planResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Plan not found' });
    }

    const plan = planResult.rows[0];
    const userId = req.user.id;

    // Create subscription
    const subscriptionResult = await query(
      `INSERT INTO user_subscriptions (user_id, plan_id, start_date, end_date, is_active, auto_renew)
       VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '1 day' * $3, true, false)
       RETURNING *`,
      [userId, plan_id, plan.duration_days]
    );

    // Record payment
    await query(
      `INSERT INTO payments (user_id, subscription_id, amount, currency, payment_method, payment_status, 
        razorpay_order_id, razorpay_payment_id, razorpay_signature, paid_at)
       VALUES ($1, $2, $3, 'INR', 'razorpay', 'success', $4, $5, $6, CURRENT_TIMESTAMP)`,
      [userId, subscriptionResult.rows[0].id, plan.price, razorpay_order_id, razorpay_payment_id, razorpay_signature]
    );

    res.json({
      success: true,
      message: 'Payment verified and subscription activated',
      data: {
        subscription: subscriptionResult.rows[0],
        plan: plan
      }
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ success: false, error: 'Payment verification failed' });
  }
};

// Get user subscriptions
const getUserSubscriptions = async (req, res) => {
  try {
    const result = await query(
      `SELECT s.*, p.plan_name, p.plan_code, p.description, p.price, p.property_limit, 
              p.featured_listings, p.priority_support, p.badge_visible, p.analytics_access
       FROM user_subscriptions s
       JOIN premium_plans p ON s.plan_id = p.id
       WHERE s.user_id = $1
       ORDER BY s.created_at DESC`,
      [req.user.id]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ success: false, error: 'Failed to get subscriptions' });
  }
};

// Get active subscription
const getActiveSubscription = async (req, res) => {
  try {
    const result = await query(
      `SELECT s.*, p.plan_name, p.plan_code, p.description, p.price, p.property_limit,
              p.featured_listings, p.priority_support, p.badge_visible, p.analytics_access
       FROM user_subscriptions s
       JOIN premium_plans p ON s.plan_id = p.id
       WHERE s.user_id = $1 AND s.is_active = true AND s.end_date > CURRENT_TIMESTAMP
       ORDER BY s.created_at DESC
       LIMIT 1`,
      [req.user.id]
    );

    res.json({ success: true, data: result.rows[0] || null });
  } catch (error) {
    console.error('Get active subscription error:', error);
    res.status(500).json({ success: false, error: 'Failed to get active subscription' });
  }
};

// Get all premium plans
const getPlans = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM premium_plans WHERE is_active = true ORDER BY sort_order ASC'
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ success: false, error: 'Failed to get plans' });
  }
};

// Get payment history
const getPaymentHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const countResult = await query(
      'SELECT COUNT(*) FROM payments WHERE user_id = $1',
      [req.user.id]
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await query(
      `SELECT p.*, pp.plan_name, pp.plan_code
       FROM payments p
       LEFT JOIN user_subscriptions s ON p.subscription_id = s.id
       LEFT JOIN premium_plans pp ON s.plan_id = pp.id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, parseInt(limit), offset]
    );

    res.json({
      success: true,
      data: result.rows,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ success: false, error: 'Failed to get payment history' });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getUserSubscriptions,
  getActiveSubscription,
  getPlans,
  getPaymentHistory
};