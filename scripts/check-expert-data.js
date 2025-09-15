// Script to check expert data for user 234@234.com
const { Pool } = require('pg');

// Database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_fzBCE2NK8ydi@ep-floral-fog-a1bvk2px-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

async function checkExpertData() {
  try {
    console.log('Checking expert data for: 234@234.com...');
    
    // Get user
    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      ['234@234.com']
    );
    
    if (userResult.rows.length === 0) {
      console.log('❌ User not found');
      return;
    }
    
    const user = userResult.rows[0];
    console.log('👤 User:', user.name, `(${user.user_type})`);
    
    // Check expert profile
    const expertProfile = await pool.query(
      'SELECT * FROM expert_profiles WHERE user_id = $1',
      [user.id]
    );
    
    if (expertProfile.rows.length > 0) {
      console.log('✅ Expert profile found:');
      const profile = expertProfile.rows[0];
      console.log('- Hourly Rate:', profile.hourly_rate);
      console.log('- Location:', profile.current_location);
      console.log('- Rating:', profile.rating);
      console.log('- Availability Status:', profile.availability_status);
    } else {
      console.log('❌ No expert profile found');
    }
    
    // Check expert skills
    const skills = await pool.query(`
      SELECT s.name, es.proficiency_level 
      FROM expert_skills es
      JOIN skills s ON es.skill_id = s.id
      WHERE es.expert_id = $1
    `, [user.id]);
    
    console.log('🎯 Skills:', skills.rows.length);
    skills.rows.forEach(skill => {
      console.log(`  - ${skill.name} (Level: ${skill.proficiency_level})`);
    });
    
    // Check applications
    const applications = await pool.query(
      'SELECT * FROM applications WHERE expert_id = $1',
      [user.id]
    );
    
    console.log('📝 Applications:', applications.rows.length);
    applications.rows.forEach(app => {
      console.log(`  - Task ID: ${app.task_id}, Status: ${app.status}, Bid: $${app.bid_amount}`);
    });
    
    // Check saved tasks
    const savedTasks = await pool.query(
      'SELECT * FROM saved_tasks WHERE user_id = $1',
      [user.id]
    );
    
    console.log('💾 Saved Tasks:', savedTasks.rows.length);
    savedTasks.rows.forEach(saved => {
      console.log(`  - Task ID: ${saved.task_id}, Saved: ${saved.created_at}`);
    });

  } catch (error) {
    console.error('❌ Error checking expert data:', error);
  } finally {
    await pool.end();
  }
}

checkExpertData();
