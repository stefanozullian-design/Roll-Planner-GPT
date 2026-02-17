-- Cement Production Planner Database Schema
-- PostgreSQL 14+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PRODUCTS & MATERIALS
-- ============================================

CREATE TABLE products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    family VARCHAR(50) NOT NULL CHECK (family IN (
        'raw_material', 
        'clinker', 
        'additive', 
        'portland_cement', 
        'blended_cement', 
        'specialty_cement'
    )),
    color VARCHAR(7),
    recipe JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_family ON products(family);

-- ============================================
-- EQUIPMENT
-- ============================================

CREATE TABLE equipment (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'kiln', 
        'raw_mill', 
        'finish_mill', 
        'silo', 
        'packing', 
        'loadout',
        'raw_material',
        'fuel',
        'additive'
    )),
    params JSONB DEFAULT '{}',
    position_x INTEGER,
    position_y INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_equipment_type ON equipment(type);

-- Process flow connections
CREATE TABLE connections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    from_equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
    to_equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    percentage DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_connections_from ON connections(from_equipment_id);
CREATE INDEX idx_connections_to ON connections(to_equipment_id);

-- ============================================
-- PRODUCTION PLANNING
-- ============================================

CREATE TABLE campaigns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'outage', 'reduced', 'stopped')),
    planned_tpd DECIMAL(10,2),
    reason VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

CREATE INDEX idx_campaigns_equipment ON campaigns(equipment_id);
CREATE INDEX idx_campaigns_dates ON campaigns(start_date, end_date);
CREATE INDEX idx_campaigns_status ON campaigns(status);

-- ============================================
-- PRODUCTION ACTUALS
-- ============================================

CREATE TABLE production_daily (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    production_date DATE NOT NULL,
    actual_tons DECIMAL(10,2) NOT NULL,
    runtime_hours DECIMAL(4,2),
    downtime_hours DECIMAL(4,2),
    downtime_reason VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(equipment_id, product_id, production_date)
);

CREATE INDEX idx_production_date ON production_daily(production_date);
CREATE INDEX idx_production_equipment ON production_daily(equipment_id);

-- ============================================
-- DEMAND PLANNING
-- ============================================

CREATE TABLE demand_forecast (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    forecast_date DATE NOT NULL,
    forecast_tons DECIMAL(10,2) NOT NULL,
    forecast_type VARCHAR(20) DEFAULT 'forecast' CHECK (forecast_type IN ('actual', 'forecast', 'committed')),
    confidence_level DECIMAL(3,2) CHECK (confidence_level BETWEEN 0 AND 1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, forecast_date)
);

CREATE INDEX idx_demand_product_date ON demand_forecast(product_id, forecast_date);
CREATE INDEX idx_demand_date ON demand_forecast(forecast_date);

-- ============================================
-- INVENTORY TRACKING
-- ============================================

CREATE TABLE inventory_daily (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    silo_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    inventory_date DATE NOT NULL,
    beginning_inventory DECIMAL(10,2),
    production DECIMAL(10,2),
    shipments DECIMAL(10,2),
    adjustments DECIMAL(10,2) DEFAULT 0,
    ending_inventory DECIMAL(10,2),
    capacity_utilization DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(silo_id, product_id, inventory_date),
    CONSTRAINT positive_inventory CHECK (ending_inventory >= 0)
);

CREATE INDEX idx_inventory_date ON inventory_daily(inventory_date);
CREATE INDEX idx_inventory_silo ON inventory_daily(silo_id);
CREATE INDEX idx_inventory_product ON inventory_daily(product_id);

-- ============================================
-- MATERIAL CONSUMPTION
-- ============================================

CREATE TABLE material_consumption (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
    material_id UUID REFERENCES products(id) ON DELETE CASCADE,
    consumption_date DATE NOT NULL,
    consumed_tons DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(equipment_id, material_id, consumption_date)
);

CREATE INDEX idx_consumption_date ON material_consumption(consumption_date);
CREATE INDEX idx_consumption_equipment ON material_consumption(equipment_id);

-- ============================================
-- ENERGY CONSUMPTION
-- ============================================

CREATE TABLE energy_daily (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
    consumption_date DATE NOT NULL,
    gcal_consumed DECIMAL(10,2),
    kwh_consumed DECIMAL(10,2),
    fuel_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(equipment_id, consumption_date)
);

CREATE INDEX idx_energy_date ON energy_daily(consumption_date);
CREATE INDEX idx_energy_equipment ON energy_daily(equipment_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_demand_updated_at BEFORE UPDATE ON demand_forecast
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- Campaign summary view
CREATE OR REPLACE VIEW campaign_summary AS
SELECT 
    c.id,
    c.start_date,
    c.end_date,
    c.status,
    c.planned_tpd,
    e.name AS equipment_name,
    e.type AS equipment_type,
    p.name AS product_name,
    p.family AS product_family,
    (c.end_date - c.start_date + 1) AS duration_days,
    (c.end_date - c.start_date + 1) * c.planned_tpd AS total_planned_tons
FROM campaigns c
LEFT JOIN equipment e ON c.equipment_id = e.id
LEFT JOIN products p ON c.product_id = p.id;

-- Daily production summary
CREATE OR REPLACE VIEW production_summary AS
SELECT 
    pd.production_date,
    e.name AS equipment_name,
    e.type AS equipment_type,
    p.name AS product_name,
    pd.actual_tons,
    pd.runtime_hours,
    CASE 
        WHEN pd.runtime_hours > 0 THEN pd.actual_tons / pd.runtime_hours 
        ELSE 0 
    END AS tph
FROM production_daily pd
LEFT JOIN equipment e ON pd.equipment_id = e.id
LEFT JOIN products p ON pd.product_id = p.id;

-- Inventory status view
CREATE OR REPLACE VIEW inventory_status AS
SELECT 
    i.inventory_date,
    e.name AS silo_name,
    p.name AS product_name,
    i.beginning_inventory,
    i.production,
    i.shipments,
    i.ending_inventory,
    i.capacity_utilization,
    (e.params->>'max_capacity_tons')::DECIMAL AS max_capacity
FROM inventory_daily i
LEFT JOIN equipment e ON i.silo_id = e.id
LEFT JOIN products p ON i.product_id = p.id;

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_user;
