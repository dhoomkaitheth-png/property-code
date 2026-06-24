-- =============================================
-- Uttarakhand Real Estate Platform
-- PostgreSQL Database Schema
-- =============================================

-- Create Database
-- CREATE DATABASE property_portal;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- MASTER TABLES (Location Hierarchy)
-- =============================================

-- Districts Table
CREATE TABLE IF NOT EXISTS districts (
    id SERIAL PRIMARY KEY,
    district_name VARCHAR(100) NOT NULL UNIQUE,
    state_name VARCHAR(50) NOT NULL DEFAULT 'Uttarakhand',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tehsils Table
CREATE TABLE IF NOT EXISTS tehsils (
    id SERIAL PRIMARY KEY,
    district_id INTEGER NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    tehsil_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(district_id, tehsil_name)
);

-- Villages Table
CREATE TABLE IF NOT EXISTS villages (
    id SERIAL PRIMARY KEY,
    district_id INTEGER NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    tehsil_id INTEGER NOT NULL REFERENCES tehsils(id) ON DELETE CASCADE,
    village_name VARCHAR(150) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tehsil_id, village_name)
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_tehsils_district_id ON tehsils(district_id);
CREATE INDEX IF NOT EXISTS idx_villages_tehsil_id ON villages(tehsil_id);
CREATE INDEX IF NOT EXISTS idx_villages_district_id ON villages(district_id);
CREATE INDEX IF NOT EXISTS idx_villages_name ON villages(village_name);

-- =============================================
-- PROPERTY TABLE
-- =============================================

CREATE TYPE property_type AS ENUM (
    'residential_house',
    'apartment_flat',
    'land_plot',
    'commercial_shop',
    'commercial_office',
    'farm_land',
    'villa',
    'other'
);

CREATE TYPE property_status AS ENUM (
    'available',
    'sold',
    'rented',
    'under_contract',
    'inactive'
);

CREATE TYPE listing_type AS ENUM (
    'sell',
    'rent',
    'lease'
);

CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Location Information
    district_id INTEGER NOT NULL REFERENCES districts(id),
    tehsil_id INTEGER NOT NULL REFERENCES tehsils(id),
    village_id INTEGER NOT NULL REFERENCES villages(id),
    local_address TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    full_address TEXT,
    pincode VARCHAR(10),

    -- Property Details
    title VARCHAR(200) NOT NULL,
    description TEXT,
    property_type property_type NOT NULL DEFAULT 'other',
    listing_type listing_type NOT NULL DEFAULT 'sell',
    status property_status NOT NULL DEFAULT 'available',

    -- Pricing
    price DECIMAL(15, 2) NOT NULL,
    price_per_sqft DECIMAL(10, 2),
    is_price_negotiable BOOLEAN DEFAULT true,

    -- Area Details
    total_area DECIMAL(12, 2) NOT NULL,
    area_unit VARCHAR(20) NOT NULL DEFAULT 'sqft',
    plot_area DECIMAL(12, 2),
    built_up_area DECIMAL(12, 2),
    carpet_area DECIMAL(12, 2),

    -- Room Details
    bedrooms INTEGER DEFAULT 0,
    bathrooms INTEGER DEFAULT 0,
    balconies INTEGER DEFAULT 0,
    floors INTEGER DEFAULT 1,
    total_floors INTEGER DEFAULT 1,
    furnishing_status VARCHAR(50), -- 'fully_furnished', 'semi_furnished', 'unfurnished'

    -- Amenities (JSON array)
    amenities JSONB DEFAULT '[]'::jsonb,

    -- Media
    images JSONB DEFAULT '[]'::jsonb,
    videos JSONB DEFAULT '[]'::jsonb,
    documents JSONB DEFAULT '[]'::jsonb,

    -- Contact Information
    owner_name VARCHAR(100),
    owner_phone VARCHAR(20) NOT NULL,
    owner_email VARCHAR(100),
    is_owner BOOLEAN DEFAULT true,

    -- Additional Details
    year_built INTEGER,
    possession_date DATE,
    property_tax_id VARCHAR(100),
    registration_number VARCHAR(100),

    -- Metadata
    is_featured BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Property Indexes
CREATE INDEX IF NOT EXISTS idx_properties_district_id ON properties(district_id);
CREATE INDEX IF NOT EXISTS idx_properties_tehsil_id ON properties(tehsil_id);
CREATE INDEX IF NOT EXISTS idx_properties_village_id ON properties(village_id);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_total_area ON properties(total_area);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_listing_type ON properties(listing_type);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_properties_is_active ON properties(is_active);
CREATE INDEX IF NOT EXISTS idx_properties_is_featured ON properties(is_featured);

-- Full text search index
CREATE INDEX IF NOT EXISTS idx_properties_title_description
    ON properties USING gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')));

-- =============================================
-- PROPERTY IMAGES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS property_images (
    id SERIAL PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_type VARCHAR(50) DEFAULT 'photo', -- 'photo', 'floor_plan', 'document'
    is_primary BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images(property_id);

-- =============================================
-- ADMIN USERS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'admin', -- 'super_admin', 'admin', 'moderator'
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- DATA IMPORT LOGS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS import_logs (
    id SERIAL PRIMARY KEY,
    import_type VARCHAR(50) NOT NULL, -- 'district', 'tehsil', 'village', 'property'
    file_name VARCHAR(255),
    total_rows INTEGER DEFAULT 0,
    success_rows INTEGER DEFAULT 0,
    failed_rows INTEGER DEFAULT 0,
    errors JSONB DEFAULT '[]'::jsonb,
    imported_by VARCHAR(100),
    status VARCHAR(20) DEFAULT 'completed', -- 'processing', 'completed', 'failed'
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- TRIGGER: Update updated_at timestamp
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_districts_updated_at
    BEFORE UPDATE ON districts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tehsils_updated_at
    BEFORE UPDATE ON tehsils
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_villages_updated_at
    BEFORE UPDATE ON villages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at
    BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- VIEW: Property with Location Details
-- =============================================

CREATE OR REPLACE VIEW property_details_view AS
SELECT
    p.*,
    d.district_name,
    t.tehsil_name,
    v.village_name,
    d.state_name
FROM properties p
JOIN districts d ON p.district_id = d.id
JOIN tehsils t ON p.tehsil_id = t.id
JOIN villages v ON p.village_id = v.id
WHERE p.is_active = true;