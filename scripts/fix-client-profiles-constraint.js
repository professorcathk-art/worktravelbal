const { Pool } = require('pg');

// Database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_fzBCE2NK8ydi@ep-floral-fog-a1bvk2px-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function fixClientProfilesConstraint() {
  try {
    console.log('🔧 Adding unique constraint to client_profiles.user_id...');
    
    // Add unique constraint on user_id in client_profiles table
    await pool.query('ALTER TABLE client_profiles ADD CONSTRAINT client_profiles_user_id_unique UNIQUE (user_id)');
    
    console.log('✅ Unique constraint added successfully to client_profiles.user_id!');
    
  } catch (error) {
    if (error.code === '23505') {
      console.log('✅ Unique constraint already exists on client_profiles.user_id');
    } else {
      console.error('❌ Error adding unique constraint:', error);
    }
  } finally {
    await pool.end();
  }
}

fixClientProfilesConstraint();
