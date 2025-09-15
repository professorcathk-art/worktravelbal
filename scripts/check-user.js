// Script to check if user exists in database
const { Pool } = require('pg');

// Database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_fzBCE2NK8ydi@ep-floral-fog-a1bvk2px-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

async function checkUser() {
  try {
    console.log('Checking user: 234@234.com...');
    
    // Check if user exists
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      ['234@234.com']
    );
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log('✅ User found:');
      console.log('- ID:', user.id);
      console.log('- Email:', user.email);
      console.log('- Name:', user.name);
      console.log('- Type:', user.user_type);
      console.log('- Verified:', user.verified);
      console.log('- Created:', user.created_at);
      
      // Check if user has client profile
      const clientProfile = await pool.query(
        'SELECT * FROM client_profiles WHERE user_id = $1',
        [user.id]
      );
      
      if (clientProfile.rows.length > 0) {
        console.log('✅ Client profile found:');
        console.log('- Company Size:', clientProfile.rows[0].company_size);
        console.log('- Industry:', clientProfile.rows[0].industry);
        console.log('- Website:', clientProfile.rows[0].website);
      } else {
        console.log('❌ No client profile found');
      }
      
      // Check if user has any tasks
      const tasks = await pool.query(
        'SELECT * FROM tasks WHERE client_id = $1',
        [user.id]
      );
      
      console.log('📋 Tasks posted:', tasks.rows.length);
      if (tasks.rows.length > 0) {
        tasks.rows.forEach((task, index) => {
          console.log(`  ${index + 1}. ${task.title} (${task.status})`);
        });
      }
      
    } else {
      console.log('❌ User not found in database');
      console.log('Available users:');
      
      const allUsers = await pool.query('SELECT email, name, user_type FROM users ORDER BY created_at DESC LIMIT 10');
      allUsers.rows.forEach(user => {
        console.log(`- ${user.email} (${user.name}) - ${user.user_type}`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking user:', error);
  } finally {
    await pool.end();
  }
}

checkUser();
