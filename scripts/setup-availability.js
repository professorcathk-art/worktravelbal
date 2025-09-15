// Script to setup availability status for experts
const { Pool } = require('pg');

// Database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_fzBCE2NK8ydi@ep-floral-fog-a1bvk2px-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

async function setupAvailability() {
  try {
    console.log('Setting up availability status for experts...');
    
    // 1. Add availability_status column to expert_profiles table
    console.log('1. Adding availability_status column...');
    await pool.query(`
      ALTER TABLE expert_profiles 
      ADD COLUMN IF NOT EXISTS availability_status VARCHAR(20) DEFAULT 'available' 
      CHECK (availability_status IN ('available', 'busy'))
    `);
    console.log('✅ Availability status column added');

    // 2. Update existing expert profiles to have 'available' status
    console.log('2. Updating existing expert profiles...');
    await pool.query(`
      UPDATE expert_profiles 
      SET availability_status = 'available' 
      WHERE availability_status IS NULL
    `);
    console.log('✅ Existing profiles updated');

    // 3. Add index for better performance
    console.log('3. Adding index...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_expert_profiles_availability 
      ON expert_profiles(availability_status)
    `);
    console.log('✅ Index created');

    // 4. Verify the setup
    const result = await pool.query(`
      SELECT COUNT(*) as total_profiles,
             COUNT(CASE WHEN availability_status = 'available' THEN 1 END) as available_profiles,
             COUNT(CASE WHEN availability_status = 'busy' THEN 1 END) as busy_profiles
      FROM expert_profiles
    `);

    console.log('\n🎉 Availability status setup completed successfully!');
    console.log('Expert profiles status:');
    console.log('- Total profiles:', result.rows[0].total_profiles);
    console.log('- Available profiles:', result.rows[0].available_profiles);
    console.log('- Busy profiles:', result.rows[0].busy_profiles);

  } catch (error) {
    console.error('❌ Error setting up availability status:', error);
  } finally {
    await pool.end();
  }
}

setupAvailability();
