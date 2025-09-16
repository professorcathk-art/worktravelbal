const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function addInterviewMessaging() {
  try {
    console.log('Adding interview columns and messaging system...');
    
    // Read and execute the SQL file
    const sqlPath = path.join(__dirname, '..', 'database', 'add_interview_columns.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.trim().substring(0, 50) + '...');
        await pool.query(statement);
      }
    }
    
    console.log('✅ Interview columns and messaging system added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding interview columns and messaging system:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the script
addInterviewMessaging().catch(console.error);
