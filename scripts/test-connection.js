// Test database connection script
const { Pool } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_fzBCE2NK8ydi@ep-floral-fog-a1bvk2px-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function testDatabaseConnection() {
  console.log('🔄 Testing Neon database connection...');
  
  const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    console.log('✅ Database connection test successful!');
    console.log('🌍 Your Neon database is ready to use');
    
    // Test a simple query
    const result = await client.query('SELECT COUNT(*) FROM users');
    console.log(`📊 Users table has ${result.rows[0].count} records`);
    
    client.release();
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testDatabaseConnection();
