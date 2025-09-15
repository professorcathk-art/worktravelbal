const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_fzBCE2NK8ydi@ep-floral-fog-a1bvk2px-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

async function setupMessages() {
  try {
    console.log('Setting up messages table and language support...');
    
    // Read and execute the SQL file
    const sqlPath = path.join(__dirname, '..', 'database', 'add_messages_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await pool.query(sql);
    
    console.log('✅ Messages table and language support created successfully!');
    
    // Add some sample expert languages for existing experts
    console.log('Adding sample languages for existing experts...');
    
    const result = await pool.query('SELECT id FROM users WHERE user_type = \'expert\' LIMIT 5');
    const expertIds = result.rows.map(row => row.id);
    
    for (const expertId of expertIds) {
      // Add Chinese and English for each expert
      await pool.query(`
        INSERT INTO expert_languages (expert_id, language_id, proficiency_level)
        SELECT $1, id, 'native' FROM languages WHERE name = '中文'
        ON CONFLICT (expert_id, language_id) DO NOTHING
      `, [expertId]);
      
      await pool.query(`
        INSERT INTO expert_languages (expert_id, language_id, proficiency_level)
        SELECT $1, id, 'fluent' FROM languages WHERE name = '英文'
        ON CONFLICT (expert_id, language_id) DO NOTHING
      `, [expertId]);
    }
    
    console.log('✅ Sample languages added for existing experts!');
    
  } catch (error) {
    console.error('❌ Error setting up messages:', error);
  } finally {
    await pool.end();
  }
}

setupMessages();
