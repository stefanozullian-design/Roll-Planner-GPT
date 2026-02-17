const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:tBdpfUPskSRtiAjArradePStXzdNgLYq@ballast.proxy.rlwy.net:11972/railway',
    ssl: {
        rejectUnauthorized: false
    }
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Database connected successfully at', res.rows[0].now);
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// ============================================
// HEALTH CHECK
// ============================================

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Cement Production Planner API',
        timestamp: new Date().toISOString()
    });
});

app.get('/', (req, res) => {
    res.json({
        name: 'Cement Production Planner API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            products: '/api/products',
            equipment: '/api/equipment',
            campaigns: '/api/campaigns',
            production: '/api/production',
            demand: '/api/demand',
            inventory: '/api/inventory',
            calculations: '/api/calculate/*'
        }
    });
});

// ============================================
// PRODUCTS API
// ============================================

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products ORDER BY name');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching product:', err);
        res.status(500).json({ error: err.message });
    }
});

// Create product
app.post('/api/products', async (req, res) => {
    const { name, family, color, recipe } = req.body;
    
    if (!name || !family) {
        return res.status(400).json({ error: 'Name and family are required' });
    }
    
    try {
        const result = await pool.query(
            'INSERT INTO products (name, family, color, recipe) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, family, color || '#3b82f6', JSON.stringify(recipe || {})]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating product:', err);
        res.status(500).json({ error: err.message });
    }
});

// Update product
app.put('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    const { name, family, color, recipe } = req.body;
    
    try {
        const result = await pool.query(
            'UPDATE products SET name=$1, family=$2, color=$3, recipe=$4 WHERE id=$5 RETURNING *',
            [name, family, color, JSON.stringify(recipe), id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ error: err.message });
    }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM products WHERE id=$1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ success: true, deleted: result.rows[0] });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ error: err.message });
    }
});

// ============================================
// EQUIPMENT API
// ============================================

// Get all equipment
app.get('/api/equipment', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM equipment ORDER BY name');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching equipment:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get single equipment
app.get('/api/equipment/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM equipment WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Equipment not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching equipment:', err);
        res.status(500).json({ error: err.message });
    }
});

// Create equipment
app.post('/api/equipment', async (req, res) => {
    const { name, type, params, position_x, position_y } = req.body;
    
    if (!name || !type) {
        return res.status(400).json({ error: 'Name and type are required' });
    }
    
    try {
        const result = await pool.query(
            'INSERT INTO equipment (name, type, params, position_x, position_y) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, type, JSON.stringify(params || {}), position_x || 0, position_y || 0]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating equipment:', err);
        res.status(500).json({ error: err.message });
    }
});

// Update equipment
app.put('/api/equipment/:id', async (req, res) => {
    const { id } = req.params;
    const { name, type, params, position_x, position_y } = req.body;
    
    try {
        const result = await pool.query(
            'UPDATE equipment SET name=$1, type=$2, params=$3, position_x=$4, position_y=$5 WHERE id=$6 RETURNING *',
            [name, type, JSON.stringify(params), position_x, position_y, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Equipment not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating equipment:', err);
        res.status(500).json({ error: err.message });
    }
});

// Delete equipment
app.delete('/api/equipment/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM equipment WHERE id=$1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Equipment not found' });
        }
        res.json({ success: true, deleted: result.rows[0] });
    } catch (err) {
        console.error('Error deleting equipment:', err);
        res.status(500).json({ error: err.message });
    }
});

// ============================================
// CONNECTIONS API
// ============================================

// Get all connections
app.get('/api/connections', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM connections');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching connections:', err);
        res.status(500).json({ error: err.message });
    }
});

// Create connection
app.post('/api/connections', async (req, res) => {
    const { from_equipment_id, to_equipment_id, product_id, percentage } = req.body;
    
    try {
        const result = await pool.query(
            'INSERT INTO connections (from_equipment_id, to_equipment_id, product_id, percentage) VALUES ($1, $2, $3, $4) RETURNING *',
            [from_equipment_id, to_equipment_id, product_id, percentage]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating connection:', err);
        res.status(500).json({ error: err.message });
    }
});

// Delete connection
app.delete('/api/connections/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM connections WHERE id=$1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Connection not found' });
        }
        res.json({ success: true, deleted: result.rows[0] });
    } catch (err) {
        console.error('Error deleting connection:', err);
        res.status(500).json({ error: err.message });
    }
});

// ============================================
// CAMPAIGNS API
// ============================================

// Get all campaigns
app.get('/api/campaigns', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT c.*, p.name as product_name, e.name as equipment_name 
            FROM campaigns c
            LEFT JOIN products p ON c.product_id = p.id
            LEFT JOIN equipment e ON c.equipment_id = e.id
            ORDER BY c.start_date DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching campaigns:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get campaigns by equipment
app.get('/api/campaigns/equipment/:equipment_id', async (req, res) => {
    const { equipment_id } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM campaigns WHERE equipment_id = $1 ORDER BY start_date',
            [equipment_id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching campaigns:', err);
        res.status(500).json({ error: err.message });
    }
});

// Create campaign
app.post('/api/campaigns', async (req, res) => {
    const { equipment_id, product_id, start_date, end_date, status, planned_tpd, reason } = req.body;
    
    if (!equipment_id || !start_date || !end_date || !status) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    try {
        const result = await pool.query(
            'INSERT INTO campaigns (equipment_id, product_id, start_date, end_date, status, planned_tpd, reason) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [equipment_id, product_id, start_date, end_date, status, planned_tpd || 0, reason]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating campaign:', err);
        res.status(500).json({ error: err.message });
    }
});

// Update campaign
app.put('/api/campaigns/:id', async (req, res) => {
    const { id } = req.params;
    const { equipment_id, product_id, start_date, end_date, status, planned_tpd, reason } = req.body;
    
    try {
        const result = await pool.query(
            'UPDATE campaigns SET equipment_id=$1, product_id=$2, start_date=$3, end_date=$4, status=$5, planned_tpd=$6, reason=$7 WHERE id=$8 RETURNING *',
            [equipment_id, product_id, start_date, end_date, status, planned_tpd, reason, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Campaign not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating campaign:', err);
        res.status(500).json({ error: err.message });
    }
});

// Delete campaign
app.delete('/api/campaigns/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM campaigns WHERE id=$1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Campaign not found' });
        }
        res.json({ success: true, deleted: result.rows[0] });
    } catch (err) {
        console.error('Error deleting campaign:', err);
        res.status(500).json({ error: err.message });
    }
});

// ============================================
// DEMAND FORECAST API
// ============================================

// Get demand forecast
app.get('/api/demand', async (req, res) => {
    const { start_date, end_date, product_id } = req.query;
    
    try {
        let query = 'SELECT * FROM demand_forecast WHERE 1=1';
        const params = [];
        let paramCount = 1;
        
        if (start_date) {
            query += ` AND forecast_date >= $${paramCount}`;
            params.push(start_date);
            paramCount++;
        }
        
        if (end_date) {
            query += ` AND forecast_date <= $${paramCount}`;
            params.push(end_date);
            paramCount++;
        }
        
        if (product_id) {
            query += ` AND product_id = $${paramCount}`;
            params.push(product_id);
        }
        
        query += ' ORDER BY forecast_date';
        
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching demand:', err);
        res.status(500).json({ error: err.message });
    }
});

// Create/update demand forecast
app.post('/api/demand', async (req, res) => {
    const { product_id, forecast_date, forecast_tons, forecast_type } = req.body;
    
    if (!product_id || !forecast_date || forecast_tons === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    try {
        const result = await pool.query(
            `INSERT INTO demand_forecast (product_id, forecast_date, forecast_tons, forecast_type) 
             VALUES ($1, $2, $3, $4) 
             ON CONFLICT (product_id, forecast_date) 
             DO UPDATE SET forecast_tons = $3, forecast_type = $4 
             RETURNING *`,
            [product_id, forecast_date, forecast_tons, forecast_type || 'forecast']
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error saving demand:', err);
        res.status(500).json({ error: err.message });
    }
});

// ============================================
// PRODUCTION ACTUAL API
// ============================================

// Get production actuals
app.get('/api/production', async (req, res) => {
    const { start_date, end_date, equipment_id } = req.query;
    
    try {
        let query = 'SELECT * FROM production_daily WHERE 1=1';
        const params = [];
        let paramCount = 1;
        
        if (start_date) {
            query += ` AND production_date >= $${paramCount}`;
            params.push(start_date);
            paramCount++;
        }
        
        if (end_date) {
            query += ` AND production_date <= $${paramCount}`;
            params.push(end_date);
            paramCount++;
        }
        
        if (equipment_id) {
            query += ` AND equipment_id = $${paramCount}`;
            params.push(equipment_id);
        }
        
        query += ' ORDER BY production_date';
        
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching production:', err);
        res.status(500).json({ error: err.message });
    }
});

// Record production actual
app.post('/api/production', async (req, res) => {
    const { equipment_id, product_id, production_date, actual_tons, runtime_hours, downtime_hours, downtime_reason } = req.body;
    
    if (!equipment_id || !product_id || !production_date || actual_tons === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    try {
        const result = await pool.query(
            `INSERT INTO production_daily (equipment_id, product_id, production_date, actual_tons, runtime_hours, downtime_hours, downtime_reason) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             ON CONFLICT (equipment_id, product_id, production_date) 
             DO UPDATE SET actual_tons = $4, runtime_hours = $5, downtime_hours = $6, downtime_reason = $7 
             RETURNING *`,
            [equipment_id, product_id, production_date, actual_tons, runtime_hours, downtime_hours, downtime_reason]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error saving production:', err);
        res.status(500).json({ error: err.message });
    }
});

// ============================================
// CALCULATION ENDPOINTS
// ============================================

// Mass balance calculation
app.post('/api/calculate/mass-balance', async (req, res) => {
    const { product_id, quantity } = req.body;
    
    if (!product_id || !quantity) {
        return res.status(400).json({ error: 'Product ID and quantity required' });
    }
    
    try {
        // Get product and recipe
        const productResult = await pool.query('SELECT * FROM products WHERE id=$1', [product_id]);
        
        if (productResult.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        const product = productResult.rows[0];
        const recipe = product.recipe || {};
        const requirements = {};
        
        // Calculate direct requirements
        for (const [material, percentage] of Object.entries(recipe)) {
            requirements[material] = quantity * (percentage / 100);
        }
        
        res.json({
            product: product.name,
            quantity: quantity,
            requirements: requirements
        });
    } catch (err) {
        console.error('Error calculating mass balance:', err);
        res.status(500).json({ error: err.message });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(port, () => {
    console.log(`🚀 Cement Production Planner API running on port ${port}`);
    console.log(`📊 Health check: http://localhost:${port}/api/health`);
});
