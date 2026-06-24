-- =============================================
-- Uttarakhand Real Estate Platform
-- Schema v2 - Additional Tables
-- =============================================

-- =============================================
-- USERS TABLE (Buyers & Sellers)
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    mobile VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'buyer', -- 'buyer', 'seller', 'agent'
    profile_image TEXT,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    fcm_token TEXT, -- Firebase Cloud Messaging token
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_mobile ON users(mobile);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- =============================================
-- FAVORITES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, property_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_property_id ON favorites(property_id);

-- =============================================
-- LEADS TABLE
-- =============================================
CREATE TYPE lead_status AS ENUM (
    'new',
    'contacted',
    'interested',
    'visit_scheduled',
    'negotiating',
    'converted',
    'closed',
    'not_interested'
);

CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    seller_id UUID, -- Can be looked up from property owner
    status lead_status NOT NULL DEFAULT 'new',
    message TEXT,
    preferred_contact_method VARCHAR(50) DEFAULT 'phone', -- 'phone', 'whatsapp', 'email'
    preferred_visit_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_leads_buyer_id ON leads(buyer_id);
CREATE INDEX IF NOT EXISTS idx_leads_property_id ON leads(property_id);
CREATE INDEX IF NOT EXISTS idx_leads_seller_id ON leads(seller_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);

-- =============================================
-- CHAT MESSAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    message TEXT,
    image_url TEXT,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_sender ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_receiver ON chat_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_chat_property ON chat_messages(property_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants ON chat_messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_chat_unread ON chat_messages(receiver_id, is_read) WHERE is_read = false;

-- =============================================
-- NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    body TEXT,
    type VARCHAR(50) NOT NULL DEFAULT 'general', -- 'chat', 'lead', 'property', 'system', 'promotion'
    reference_type VARCHAR(50), -- 'property', 'lead', 'chat', 'system'
    reference_id VARCHAR(100),
    data JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- =============================================
-- PROPERTY VIDEOS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS property_videos (
    id SERIAL PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    video_type VARCHAR(50) DEFAULT 'walkthrough', -- 'walkthrough', 'drone', 'tour', 'other'
    thumbnail_url TEXT,
    title VARCHAR(200),
    sort_order INTEGER DEFAULT 0,
    duration INTEGER, -- in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_property_videos_property_id ON property_videos(property_id);

-- =============================================
-- PROPERTY DOCUMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS property_documents (
    id SERIAL PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    document_url TEXT NOT NULL,
    document_type VARCHAR(50) NOT NULL, -- 'title_deed', 'tax_receipt', 'map', 'agreement', 'noc', 'other'
    document_name VARCHAR(200),
    file_size INTEGER,
    is_verified BOOLEAN DEFAULT false,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_property_documents_property_id ON property_documents(property_id);
CREATE INDEX IF NOT EXISTS idx_property_documents_type ON property_documents(document_type);

-- =============================================
-- USER SESSIONS TABLE (for tracking)
-- =============================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL,
    device_info JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token);

-- =============================================
-- PROPERTY REVIEWS/RATINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS property_reviews (
    id SERIAL PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    is_verified_purchase BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(property_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_property_reviews_property ON property_reviews(property_id);
CREATE INDEX IF NOT EXISTS idx_property_reviews_user ON property_reviews(user_id);

-- =============================================
-- TRIGGERS for updated_at
-- =============================================
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- VIEW: Full Property Details with All Media
-- =============================================
CREATE OR REPLACE VIEW property_full_view AS
SELECT
    p.*,
    d.district_name,
    t.tehsil_name,
    v.village_name,
    d.state_name,
    COALESCE(
        json_agg(DISTINCT jsonb_build_object(
            'id', pi.id,
            'url', pi.image_url,
            'is_primary', pi.is_primary,
            'type', pi.image_type
        )) FILTER (WHERE pi.id IS NOT NULL),
        '[]'::json
    ) as images_array,
    COALESCE(
        json_agg(DISTINCT jsonb_build_object(
            'id', pv.id,
            'url', pv.video_url,
            'type', pv.video_type,
            'thumbnail', pv.thumbnail_url
        )) FILTER (WHERE pv.id IS NOT NULL),
        '[]'::json
    ) as videos_array,
    COALESCE(
        json_agg(DISTINCT jsonb_build_object(
            'id', pd.id,
            'url', pd.document_url,
            'type', pd.document_type,
            'name', pd.document_name
        )) FILTER (WHERE pd.id IS NOT NULL),
        '[]'::json
    ) as documents_array
FROM properties p
JOIN districts d ON p.district_id = d.id
JOIN tehsils t ON p.tehsil_id = t.id
JOIN villages v ON p.village_id = v.id
LEFT JOIN property_images pi ON p.id = pi.property_id
LEFT JOIN property_videos pv ON p.id = pv.property_id
LEFT JOIN property_documents pd ON p.id = pd.property_id
WHERE p.is_active = true
GROUP BY p.id, d.id, t.id, v.id;

-- =============================================
-- VIEW: User Activities
-- =============================================
CREATE OR REPLACE VIEW user_activity_view AS
SELECT
    u.id as user_id,
    u.name,
    u.email,
    u.mobile,
    u.role,
    COUNT(DISTINCT f.id) as total_favorites,
    COUNT(DISTINCT l.id) as total_leads,
    COUNT(DISTINCT cm.id) as total_messages,
    COUNT(DISTINCT pr.id) as total_reviews,
    u.last_login,
    u.created_at as registered_at
FROM users u
LEFT JOIN favorites f ON u.id = f.user_id
LEFT JOIN leads l ON u.id = l.buyer_id
LEFT JOIN chat_messages cm ON u.id = cm.sender_id
LEFT JOIN property_reviews pr ON u.id = pr.user_id
GROUP BY u.id;