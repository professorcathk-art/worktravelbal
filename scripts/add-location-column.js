const { Pool } = require('pg');

// Database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_fzBCE2NK8ydi@ep-floral-fog-a1bvk2px-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function addLocationColumn() {
  try {
    console.log('🔧 Adding location column to users table...');
    
    // Add location column to users table
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS location VARCHAR(255)');
    
    console.log('✅ Location column added successfully to users table!');
    
  } catch (error) {
    console.error('❌ Error adding location column:', error);
  } finally {
    await pool.end();
  }
}

addLocationColumn();
