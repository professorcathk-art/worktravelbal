const { Pool } = require('pg');

// Database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_fzBCE2NK8ydi@ep-floral-fog-a1bvk2px-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function addBusinessLicenseColumn() {
  try {
    console.log('🔧 Adding business_license_url column to users table...');
    
    // Add business_license_url column to users table
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS business_license_url VARCHAR(500)');
    
    console.log('✅ business_license_url column added successfully to users table!');
    
  } catch (error) {
    console.error('❌ Error adding business_license_url column:', error);
  } finally {
    await pool.end();
  }
}

addBusinessLicenseColumn();
