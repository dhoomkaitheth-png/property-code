-- =============================================
-- Uttarakhand Real Estate Platform
-- Schema v3 - Complete Missing Tables
-- =============================================

-- =============================================
-- AMENITIES MASTER TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS amenities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50) DEFAULT 'bi-check-lg',
    category VARCHAR(50) DEFAULT 'general', -- 'society', 'security', 'utility', 'entertainment', 'fitness'
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- PROPERTY AMENITIES JUNCTION TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS property_amenities (
    id SERIAL PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    amenity_id INTEGER NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(property_id, amenity_id)
);

CREATE INDEX IF NOT EXISTS idx_property_amenities_property ON property_amenities(property_id);
CREATE INDEX IF NOT EXISTS idx_property_amenities_amenity ON property_amenities(amenity_id);

-- =============================================
-- OTP VERIFICATION TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS otp_verification (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    mobile VARCHAR(20) NOT NULL,
    email VARCHAR(150),
    otp_code VARCHAR(6) NOT NULL,
    purpose VARCHAR(50) NOT NULL DEFAULT 'registration', -- 'registration', 'login', 'password_reset', 'mobile_update'
    is_verified BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_otp_mobile ON otp_verification(mobile);
CREATE INDEX IF NOT EXISTS idx_otp_user ON otp_verification(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_purpose ON otp_verification(purpose);

-- =============================================
-- PASSWORD RESET TOKENS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    is_used BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_password_reset_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_user ON password_reset_tokens(user_id);

-- =============================================
-- PREMIUM PLANS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS premium_plans (
    id SERIAL PRIMARY KEY,
    plan_name VARCHAR(100) NOT NULL,
    plan_code VARCHAR(50) NOT NULL UNIQUE, -- 'basic', 'standard', 'premium', 'enterprise'
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    duration_days INTEGER NOT NULL,
    property_limit INTEGER DEFAULT 10, -- number of properties allowed
    featured_listings INTEGER DEFAULT 0,
    priority_support BOOLEAN DEFAULT false,
    badge_visible BOOLEAN DEFAULT false,
    analytics_access BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- USER SUBSCRIPTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id INTEGER NOT NULL REFERENCES premium_plans(id),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    auto_renew BOOLEAN DEFAULT false,
    payment_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_active ON user_subscriptions(user_id, is_active);

-- =============================================
-- PAYMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id INTEGER REFERENCES user_subscriptions(id),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    payment_method VARCHAR(50), -- 'razorpay', 'stripe', 'paypal', 'bank_transfer'
    payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'success', 'failed', 'refunded'
    transaction_id VARCHAR(200),
    razorpay_order_id VARCHAR(200),
    razorpay_payment_id VARCHAR(200),
    razorpay_signature VARCHAR(500),
    payment_data JSONB DEFAULT '{}'::jsonb,
    description TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_transaction ON payments(transaction_id);

-- =============================================
-- BLOGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS blogs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(250) NOT NULL UNIQUE,
    content TEXT NOT NULL,
    excerpt TEXT,
    featured_image TEXT,
    author VARCHAR(100),
    author_id UUID REFERENCES users(id),
    category VARCHAR(50) DEFAULT 'general', -- 'market_insights', 'buying_guide', 'selling_tips', 'legal', 'local_info'
    tags TEXT[],
    is_published BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_category ON blogs(category);
CREATE INDEX IF NOT EXISTS idx_blogs_published ON blogs(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_author ON blogs(author_id);

-- =============================================
-- SEARCH HISTORY TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS search_history (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(100),
    search_query TEXT,
    filters JSONB DEFAULT '{}'::jsonb,
    result_count INTEGER DEFAULT 0,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_search_history_user ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created ON search_history(created_at DESC);

-- =============================================
-- CONTACT ENQUIRIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS contact_enquiries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    mobile VARCHAR(20),
    subject VARCHAR(200),
    message TEXT NOT NULL,
    property_id UUID REFERENCES properties(id),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    replied_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contact_enquiries_read ON contact_enquiries(is_read);
CREATE INDEX IF NOT EXISTS idx_contact_enquiries_created ON contact_enquiries(created_at DESC);

-- =============================================
-- PROPERTY VIEWS TABLE (Detailed tracking)
-- =============================================
CREATE TABLE IF NOT EXISTS property_views (
    id SERIAL PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    session_id VARCHAR(100),
    ip_address VARCHAR(50),
    user_agent TEXT,
    duration_seconds INTEGER DEFAULT 0,
    source VARCHAR(50), -- 'search', 'direct', 'social', 'whatsapp', 'email'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_property_views_property ON property_views(property_id);
CREATE INDEX IF NOT EXISTS idx_property_views_created ON property_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_property_views_user ON property_views(user_id);

-- =============================================
-- PROPERTY REPORTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS property_reports (
    id SERIAL PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES users(id),
    reporter_name VARCHAR(100),
    reporter_email VARCHAR(150),
    reporter_phone VARCHAR(20),
    report_reason VARCHAR(50) NOT NULL, -- 'spam', 'fake', 'wrong_info', 'outdated', 'fraud', 'other'
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'reviewing', 'resolved', 'dismissed'
    admin_notes TEXT,
    resolved_by INTEGER REFERENCES admin_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_property_reports_property ON property_reports(property_id);
CREATE INDEX IF NOT EXISTS idx_property_reports_status ON property_reports(status);

-- =============================================
-- SCHEDULED VISITS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS scheduled_visits (
    id SERIAL PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    visitor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES users(id),
    visit_date DATE NOT NULL,
    visit_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'
    visitor_message TEXT,
    owner_notes TEXT,
    is_visitor_notified BOOLEAN DEFAULT false,
    is_owner_notified BOOLEAN DEFAULT false,
    cancelled_by VARCHAR(50),
    cancellation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(property_id, visitor_id, visit_date, visit_time)
);

CREATE INDEX IF NOT EXISTS idx_scheduled_visits_property ON scheduled_visits(property_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_visits_visitor ON scheduled_visits(visitor_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_visits_owner ON scheduled_visits(owner_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_visits_date ON scheduled_visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_scheduled_visits_status ON scheduled_visits(status);

-- =============================================
-- AGENT PROFILES EXTENSION TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS agent_profiles (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    company_name VARCHAR(200),
    company_address TEXT,
    license_number VARCHAR(100),
    experience_years INTEGER DEFAULT 0,
    specialization VARCHAR(200), -- 'residential', 'commercial', 'land', 'luxury'
    service_areas INTEGER[], -- district IDs array
    about TEXT,
    website VARCHAR(200),
    social_links JSONB DEFAULT '{}'::jsonb,
    rating DECIMAL(2, 1) DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    total_properties_sold INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agent_profiles_user ON agent_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_profiles_verified ON agent_profiles(is_verified);

-- =============================================
-- TRIGGERS for updated_at
-- =============================================
CREATE TRIGGER update_premium_plans_updated_at
    BEFORE UPDATE ON premium_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blogs_updated_at
    BEFORE UPDATE ON blogs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_reports_updated_at
    BEFORE UPDATE ON property_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_visits_updated_at
    BEFORE UPDATE ON scheduled_visits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_profiles_updated_at
    BEFORE UPDATE ON agent_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SEED AMENITIES DATA
-- =============================================
INSERT INTO amenities (name, icon, category, sort_order) VALUES
-- Security
('Gated Community', 'bi-shield-check', 'security', 1),
('Security Guard', 'bi-person-badge', 'security', 2),
('CCTV Surveillance', 'bi-camera-video', 'security', 3),
('Intercom Facility', 'bi-telephone', 'security', 4),

-- Society
('Club House', 'bi-building', 'society', 5),
('Community Hall', 'bi-people', 'society', 6),
('Visitor Parking', 'bi-car-front', 'society', 7),
('Guest Room', 'bi-door-open', 'society', 8),

-- Utility
('24x7 Water Supply', 'bi-droplet', 'utility', 9),
('Electricity Backup', 'bi-lightning', 'utility', 10),
('Rain Water Harvesting', 'bi-cloud-rain', 'utility', 11),
('Sewage Treatment', 'bi-gear', 'utility', 12),
('Gas Pipeline', 'bi-fire', 'utility', 13),

-- Fitness
('Swimming Pool', 'bi-water', 'fitness', 14),
('Gym', 'bi-heart-pulse', 'fitness', 15),
('Jogging Track', 'bi-person-walking', 'fitness', 16),
('Yoga Lawn', 'bi-flower1', 'fitness', 17),
('Tennis Court', 'bi-dpad', 'fitness', 18),
('Badminton Court', 'bi-grid-3x3', 'fitness', 19),

-- Entertainment
('Children Play Area', 'bi-emoji-smile', 'entertainment', 20),
('Garden / Park', 'bi-tree', 'entertainment', 21),
('Indoor Games Room', 'bi-controller', 'entertainment', 22),
('Home Theatre', 'bi-film', 'entertainment', 23),

-- Accessibility
('Lift', 'bi-arrow-up-circle', 'general', 24),
('Ramp for Disabled', 'bi-universal-access', 'general', 25),
('Wheelchair Accessible', 'bi-wheelchair', 'general', 26),

-- Parking
('Covered Parking', 'bi-car-front', 'general', 27),
('Two Wheeler Parking', 'bi-bicycle', 'general', 28),
('EV Charging Station', 'bi-ev-station', 'general', 29),

-- Location
('Near School', 'bi-book', 'general', 30),
('Near Hospital', 'bi-hospital', 'general', 31),
('Near Mall', 'bi-shop', 'general', 32),
('Near Metro Station', 'bi-train-front', 'general', 33),
('Near Bus Stop', 'bi-bus-front', 'general', 34),
('Near Highway', 'bi-signpost-2', 'general', 35)
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- SEED PREMIUM PLANS
-- =============================================
INSERT INTO premium_plans (plan_name, plan_code, description, price, duration_days, property_limit, featured_listings, priority_support, badge_visible, analytics_access, sort_order) VALUES
('Basic', 'basic', 'Perfect for individual sellers. List up to 5 properties.', 499, 30, 5, 0, false, false, false, 1),
('Standard', 'standard', 'Great for growing agents. Get more visibility.', 999, 30, 20, 3, true, true, false, 2),
('Premium', 'premium', 'For professional agents. Maximum exposure.', 1999, 30, 50, 10, true, true, true, 3),
('Enterprise', 'enterprise', 'For real estate agencies and builders.', 4999, 90, 200, 30, true, true, true, 4)
ON CONFLICT (plan_code) DO NOTHING;

-- =============================================
-- SEED DEMO BLOG
-- =============================================
INSERT INTO blogs (title, slug, content, excerpt, category, is_published, published_at) VALUES
(
    'Complete Guide to Buying Property in Uttarakhand',
    'complete-guide-buying-property-uttarakhand',
    '<h2>Buying Property in Uttarakhand: A Comprehensive Guide</h2><p>Uttarakhand, known as the "Land of Gods," has become one of India''s most sought-after real estate destinations. From the serene hill stations of Nainital and Mussoorie to the developing urban centers of Dehradun and Haridwar, the state offers diverse property options.</p><h3>Legal Documentation Required</h3><p>Before purchasing any property in Uttarakhand, ensure you have the following documents checked:</p><ul><li>Title Deed (Sale Deed)</li><li>Mutation Record (Khatauni)</li><li>Property Tax Receipts</li><li>Building Plan Approval</li><li>No Objection Certificates (NOCs)</li></ul><h3>Popular Investment Locations</h3><p><strong>Dehradun:</strong> The capital city offers excellent connectivity and infrastructure. Areas like Vasant Vihar, Patel Nagar, and Sahastradhara Road are popular choices.</p><p><strong>Haridwar:</strong> A spiritual center with growing real estate. The areas near Haridwar-Roorkee Road are developing rapidly.</p><p><strong>Nainital:</strong> Hill station properties are premium investments. Haldwani and Kathgodam serve as gateway cities.</p><h3>Tips for Buyers</h3><p>1. Verify land records at the Tehsil office<br>2. Check for any pending litigation<br>3. Ensure the property is not in a restricted area<br>4. Get a professional property valuation<br>5. Understand the local zoning regulations</p>',
    'A comprehensive guide covering everything you need to know before buying property in Uttarakhand - from legal documentation to the best locations.',
    'buying_guide',
    true,
    CURRENT_TIMESTAMP
),
(
    'Top 5 Districts for Real Estate Investment in Uttarakhand (2026)',
    'top-5-districts-real-estate-investment-uttarakhand-2026',
    '<h2>Best Districts for Property Investment in Uttarakhand</h2><p>The real estate market in Uttarakhand has shown remarkable growth in 2026. Here are the top districts for investment:</p><h3>1. Dehradun</h3><p>With the best connectivity, educational institutions, and healthcare facilities, Dehradun remains the top choice for property investment. The upcoming expressways and metro project have boosted property values significantly.</p><h3>2. Haridwar</h3><p>Industrial development and religious tourism drive the property market in Haridwar. The area near the upcoming greenfield airport is seeing rapid development.</p><h3>3. Udham Singh Nagar</h3><p>Rudrapur and Kashipur are emerging as industrial hubs. The Pantnagar airport and proximity to Nainital make this district attractive.</p><h3>4. Nainital</h3><p>Haldwani-Kathgodam belt offers excellent connectivity to the hills. Property in Bhimtal and Ramnagar is appreciating steadily.</p><h3>5. Rishikesh</h3><p>The yoga capital of the world attracts global attention. Luxury villas and commercial properties near the Ganges are premium investments.</p>',
    'Discover the top 5 districts in Uttarakhand offering the best returns on real estate investment in 2026.',
    'market_insights',
    true,
    CURRENT_TIMESTAMP
),
(
    'How to Sell Your Property Fast in Uttarakhand',
    'how-to-sell-property-fast-uttarakhand',
    '<h2>Tips for Quick Property Sale in Uttarakhand</h2><p>Selling property in Uttarakhand requires a strategic approach. Here are proven tips to sell your property quickly:</p><h3>1. Price It Right</h3><p>Research recent sales in your area. Overpricing is the biggest mistake sellers make. Get a professional valuation done.</p><h3>2. Improve Curb Appeal</h3><p>First impressions matter. Clean the property, paint if needed, and ensure the garden or balcony looks inviting. A well-maintained property sells 30% faster.</p><h3>3. High-Quality Photos</h3><p>Professional photos can make a huge difference. Capture the property during golden hour and highlight the best features. Consider drone shots for larger properties.</p><h3>4. Use Multiple Platforms</h3><p>List your property on multiple platforms. Our platform gives you exposure to serious buyers across Uttarakhand.</p><h3>5. Be Flexible with Timings</h3><p>Accommodate visit schedules, including weekends and evenings. The more people see your property, the higher the chances of a quick sale.</p>',
    'Learn effective strategies to sell your property quickly in the Uttarakhand real estate market.',
    'selling_tips',
    true,
    CURRENT_TIMESTAMP
);

-- =============================================
-- VIEW: Property Dashboard Stats
-- =============================================
CREATE OR REPLACE VIEW property_dashboard_stats AS
SELECT
    COUNT(*)::int as total_properties,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int as last_30_days,
    COUNT(*) FILTER (WHERE status = 'available')::int as available,
    COUNT(*) FILTER (WHERE status = 'sold')::int as sold,
    COUNT(*) FILTER (WHERE status = 'rented')::int as rented,
    COUNT(*) FILTER (WHERE is_featured = true)::int as featured,
    COUNT(*) FILTER (WHERE is_active = false)::int as inactive,
    COUNT(*) FILTER (WHERE property_type = 'residential_house')::int as houses,
    COUNT(*) FILTER (WHERE property_type = 'apartment_flat')::int as apartments,
    COUNT(*) FILTER (WHERE property_type = 'land_plot')::int as land_plots,
    COUNT(*) FILTER (WHERE property_type = 'commercial_shop')::int as commercial_shops,
    ROUND(AVG(price)::numeric, 2)::float as avg_price,
    SUM(view_count)::int as total_views
FROM properties;

-- =============================================
-- VIEW: User Dashboard Stats
-- =============================================
CREATE OR REPLACE VIEW user_dashboard_stats AS
SELECT
    u.id as user_id,
    u.name,
    u.email,
    u.role,
    COUNT(DISTINCT p.id) FILTER (WHERE p.created_by = u.id::text OR p.owner_email = u.email)::int as my_properties,
    COUNT(DISTINCT f.id)::int as total_favorites,
    COUNT(DISTINCT l.id)::int as total_leads,
    COUNT(DISTINCT l.id) FILTER (WHERE l.status = 'new')::int as new_leads,
    COUNT(DISTINCT cm.id) FILTER (WHERE cm.receiver_id = u.id AND cm.is_read = false)::int as unread_messages,
    COUNT(DISTINCT n.id) FILTER (WHERE n.is_read = false)::int as unread_notifications
FROM users u
LEFT JOIN properties p ON p.created_by = u.id::text
LEFT JOIN favorites f ON u.id = f.user_id
LEFT JOIN leads l ON u.id = l.seller_id OR u.id = l.buyer_id
LEFT JOIN chat_messages cm ON cm.receiver_id = u.id
LEFT JOIN notifications n ON n.user_id = u.id
GROUP BY u.id;