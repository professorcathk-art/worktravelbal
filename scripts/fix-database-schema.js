const { Pool } = require('pg');

// Database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_fzBCE2NK8ydi@ep-floral-fog-a1bvk2px-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function fixDatabaseSchema() {
  try {
    console.log('🔧 Fixing database schema...');
    
    // Add missing columns to users table
    console.log('Adding wechat column to users table...');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS wechat VARCHAR(100)');
    
    console.log('Adding line column to users table...');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS line VARCHAR(100)');
    
    // Add missing columns to expert_profiles table
    console.log('Adding avatar_url column to expert_profiles table...');
    await pool.query('ALTER TABLE expert_profiles ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500)');
    
    console.log('Adding availability_status column to expert_profiles table...');
    await pool.query('ALTER TABLE expert_profiles ADD COLUMN IF NOT EXISTS availability_status VARCHAR(20) DEFAULT \'busy\'');
    
    // Update user_type constraint to include 'admin'
    console.log('Updating user_type constraint...');
    await pool.query('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_user_type_check');
    await pool.query('ALTER TABLE users ADD CONSTRAINT users_user_type_check CHECK (user_type IN (\'expert\', \'client\', \'admin\'))');
    
    // Update tasks table
    console.log('Adding currency column to tasks table...');
    await pool.query('ALTER TABLE tasks ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT \'USD\'');
    
    console.log('Updating tasks status constraint...');
    await pool.query('ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check');
    await pool.query('ALTER TABLE tasks ADD CONSTRAINT tasks_status_check CHECK (status IN (\'pending\', \'open\', \'in_progress\', \'completed\', \'cancelled\'))');
    
    // Add missing columns to client_profiles table
    console.log('Adding phone column to client_profiles table...');
    await pool.query('ALTER TABLE client_profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(50)');
    
    console.log('Adding wechat column to client_profiles table...');
    await pool.query('ALTER TABLE client_profiles ADD COLUMN IF NOT EXISTS wechat VARCHAR(100)');
    
    console.log('Adding line column to client_profiles table...');
    await pool.query('ALTER TABLE client_profiles ADD COLUMN IF NOT EXISTS line VARCHAR(100)');
    
    console.log('Adding business_license_url column to client_profiles table...');
    await pool.query('ALTER TABLE client_profiles ADD COLUMN IF NOT EXISTS business_license_url VARCHAR(500)');
    
    console.log('✅ Database schema fixed successfully!');
    console.log('Added missing columns:');
    console.log('- users.wechat');
    console.log('- users.line');
    console.log('- expert_profiles.avatar_url');
    console.log('- expert_profiles.availability_status');
    console.log('- client_profiles.phone');
    console.log('- client_profiles.wechat');
    console.log('- client_profiles.line');
    console.log('- client_profiles.business_license_url');
    console.log('- tasks.currency');
    console.log('Updated constraints for user_type and task status');
    
  } catch (error) {
    console.error('❌ Error fixing database schema:', error);
  } finally {
    await pool.end();
  }
}

fixDatabaseSchema();