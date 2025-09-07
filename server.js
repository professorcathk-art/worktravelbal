// Simple API server for the digital nomad platform
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
const connectionString = 'postgresql://neondb_owner:npg_fzBCE2NK8ydi@ep-floral-fog-a1bvk2px-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Test database connection
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    client.release();
    return true;
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    return false;
  }
}

// API Routes

// Get all experts
app.get('/api/experts', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.*, ep.hourly_rate, ep.current_location, ep.rating, ep.reviews_count, ep.response_time, ep.availability, ep.completed_projects,
             ARRAY_AGG(DISTINCT s.name) as skills
      FROM users u
      LEFT JOIN expert_profiles ep ON u.id = ep.user_id
      LEFT JOIN expert_skills es ON u.id = es.expert_id
      LEFT JOIN skills s ON es.skill_id = s.id
      WHERE u.user_type = 'expert'
      GROUP BY u.id, ep.id
      ORDER BY ep.rating DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching experts:', error);
    res.status(500).json({ error: 'Failed to fetch experts' });
  }
});

// Get all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, tc.name as category_name, u.name as client_name,
             ARRAY_AGG(DISTINCT s.name) as skills
      FROM tasks t
      LEFT JOIN task_categories tc ON t.category_id = tc.id
      LEFT JOIN users u ON t.client_id = u.id
      LEFT JOIN task_skills ts ON t.id = ts.task_id
      LEFT JOIN skills s ON ts.skill_id = s.id
      WHERE t.status = 'open'
      GROUP BY t.id, tc.name, u.name
      ORDER BY t.created_at DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get all destinations
app.get('/api/destinations', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM destinations
      ORDER BY nomad_count DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching destinations:', error);
    res.status(500).json({ error: 'Failed to fetch destinations' });
  }
});

// Get all task categories
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT tc.*, COUNT(s.id) as skill_count
      FROM task_categories tc
      LEFT JOIN skills s ON tc.name = s.category
      GROUP BY tc.id
      ORDER BY tc.name
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get all skills
app.get('/api/skills', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM skills
      ORDER BY category, name
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

// Create a new user
app.post('/api/users', async (req, res) => {
  try {
    const { email, password_hash, name, user_type, phone, bio } = req.body;
    
    const result = await pool.query(`
      INSERT INTO users (email, password_hash, name, user_type, phone, bio)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [email, password_hash, name, user_type, phone, bio]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Create a new task
app.post('/api/tasks', async (req, res) => {
  try {
    const { client_id, title, description, budget_min, budget_max, duration, category_id, experience_level, deadline } = req.body;
    
    const result = await pool.query(`
      INSERT INTO tasks (client_id, title, description, budget_min, budget_max, duration, category_id, experience_level, deadline)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [client_id, title, description, budget_min, budget_max, duration, category_id, experience_level, deadline]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Create a new application
app.post('/api/applications', async (req, res) => {
  try {
    const { task_id, expert_id, proposal_text, bid_amount, delivery_time, portfolio_link } = req.body;
    
    const result = await pool.query(`
      INSERT INTO applications (task_id, expert_id, proposal_text, bid_amount, delivery_time, portfolio_link)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [task_id, expert_id, proposal_text, bid_amount, delivery_time, portfolio_link]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ error: 'Failed to create application' });
  }
});

// Save/unsave a task
app.post('/api/saved-tasks', async (req, res) => {
  try {
    const { user_id, task_id, action } = req.body; // action: 'save' or 'unsave'
    
    if (action === 'save') {
      await pool.query(`
        INSERT INTO saved_tasks (user_id, task_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id, task_id) DO NOTHING
      `, [user_id, task_id]);
    } else if (action === 'unsave') {
      await pool.query(`
        DELETE FROM saved_tasks
        WHERE user_id = $1 AND task_id = $2
      `, [user_id, task_id]);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error managing saved task:', error);
    res.status(500).json({ error: 'Failed to manage saved task' });
  }
});

// Get user's saved tasks
app.get('/api/users/:userId/saved-tasks', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(`
      SELECT t.*, tc.name as category_name
      FROM saved_tasks st
      JOIN tasks t ON st.task_id = t.id
      LEFT JOIN task_categories tc ON t.category_id = tc.id
      WHERE st.user_id = $1
      ORDER BY st.created_at DESC
    `, [userId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching saved tasks:', error);
    res.status(500).json({ error: 'Failed to fetch saved tasks' });
  }
});

// Get user's applications
app.get('/api/users/:userId/applications', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(`
      SELECT a.*, t.title, t.budget_min, t.budget_max, t.currency
      FROM applications a
      JOIN tasks t ON a.task_id = t.id
      WHERE a.expert_id = $1
      ORDER BY a.created_at DESC
    `, [userId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const isConnected = await testConnection();
    res.json({ 
      status: 'ok', 
      database: isConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      database: 'disconnected',
      error: error.message 
    });
  }
});

// Serve the main application
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
async function startServer() {
  try {
    // Test database connection
    await testConnection();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 API endpoints available at http://localhost:${PORT}/api/`);
      console.log(`🌍 Digital Nomad Platform ready!`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
