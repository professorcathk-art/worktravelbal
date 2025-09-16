const { Pool } = require('pg');

// Database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_fzBCE2NK8ydi@ep-floral-fog-a1bvk2px-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function fixExpertProfilesConstraint() {
  try {
    console.log('🔧 Adding unique constraint to expert_profiles.user_id...');
    
    // Add unique constraint on user_id in expert_profiles table
    await pool.query('ALTER TABLE expert_profiles ADD CONSTRAINT expert_profiles_user_id_unique UNIQUE (user_id)');
    
    console.log('✅ Unique constraint added successfully to expert_profiles.user_id!');
    
  } catch (error) {
    if (error.code === '23505') {
      console.log('✅ Unique constraint already exists on expert_profiles.user_id');
    } else {
      console.error('❌ Error adding unique constraint:', error);
    }
  } finally {
    await pool.end();
  }
}

fixExpertProfilesConstraint();
