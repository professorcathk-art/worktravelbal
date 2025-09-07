// Database initialization script for Neon
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const config = require('../config/config');

async function initializeDatabase() {
  const pool = new Pool({
    connectionString: config.database.url,
    ssl: config.database.ssl
  });

  try {
    console.log('🔄 Connecting to Neon database...');
    
    // Test connection
    const client = await pool.connect();
    console.log('✅ Connected to Neon database successfully');
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('🔄 Creating database schema...');
    await client.query(schema);
    console.log('✅ Database schema created successfully');
    
    // Verify tables were created
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📋 Created tables:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    client.release();
    console.log('🎉 Database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('✅ Database setup complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database setup failed:', error);
      process.exit(1);
    });
}

module.exports = initializeDatabase;
