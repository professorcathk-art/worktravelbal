// Database connection test endpoint
const { Pool } = require('pg');

// Database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_fzBCE2NK8ydi@ep-floral-fog-a1bvk2px-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    console.log('Testing database connection...');
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('Connection string length:', connectionString.length);
    
    const client = await pool.connect();
    console.log('Database connection successful!');
    
    // Test a simple query
    const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
    console.log('Query result:', result.rows[0]);
    
    client.release();
    
    res.status(200).json({
      success: true,
      message: 'Database connection successful',
      timestamp: new Date().toISOString(),
      database_time: result.rows[0].current_time,
      postgres_version: result.rows[0].postgres_version,
      env_var_set: !!process.env.DATABASE_URL
    });
    
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).json({
      success: false,
      error: 'Database connection failed',
      message: error.message,
      code: error.code,
      env_var_set: !!process.env.DATABASE_URL,
      connection_string_length: connectionString.length
    });
  }
};
