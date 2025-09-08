// API endpoint for users (login, register, get user by email)
const { Pool } = require('pg');

// Database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_fzBCE2NK8ydi@ep-floral-fog-a1bvk2px-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    // Get user by email
    try {
      const { email } = req.query;
      
      if (!email) {
        return res.status(400).json({ error: 'email is required' });
      }

      console.log('Fetching user by email:', email);

      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      
      console.log('Found', result.rows.length, 'users with email');
      res.status(200).json(result.rows);
      
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ 
        error: 'Failed to fetch user',
        details: error.message
      });
    }
  } else if (req.method === 'POST') {
    // Create a new user
    try {
      const {
        email,
        password_hash,
        name,
        user_type,
        phone,
        bio
      } = req.body;

      console.log('Creating user with data:', {
        email,
        name,
        user_type
      });

      // Validate required fields
      if (!email || !password_hash || !name || !user_type) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if user already exists
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      // Create the user
      const result = await pool.query(`
        INSERT INTO users (
          email, password_hash, name, user_type, phone, bio, verified, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING *
      `, [
        email, password_hash, name, user_type, phone || null, bio || null, true
      ]);

      console.log('User created successfully:', result.rows[0].id);
      res.status(201).json({
        message: 'User created successfully',
        user: result.rows[0]
      });

    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ 
        error: 'Failed to create user',
        details: error.message
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
