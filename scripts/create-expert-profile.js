// Script to create expert profile for user 234@234.com
const { Pool } = require('pg');

// Database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_fzBCE2NK8ydi@ep-floral-fog-a1bvk2px-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

async function createExpertProfile() {
  try {
    console.log('Creating expert profile for: 234@234.com...');
    
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
    
    // Create expert profile
    const profileResult = await pool.query(`
      INSERT INTO expert_profiles (
        user_id, 
        hourly_rate, 
        current_location, 
        timezone, 
        rating, 
        reviews_count, 
        response_time, 
        availability, 
        completed_projects,
        availability_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (user_id) DO UPDATE SET
        hourly_rate = $2,
        current_location = $3,
        timezone = $4,
        rating = $5,
        reviews_count = $6,
        response_time = $7,
        availability = $8,
        completed_projects = $9,
        availability_status = $10,
        updated_at = NOW()
      RETURNING *
    `, [
      user.id,
      '$40-60',
      '台北, 台灣',
      'GMT+8',
      4.5,
      12,
      '2小時內',
      '全職',
      8,
      'available'
    ]);
    
    console.log('✅ Expert profile created/updated');
    
    // Add some basic skills
    const skills = ['React', 'JavaScript', 'Node.js', 'UI/UX設計'];
    
    for (const skillName of skills) {
      // Get or create skill
      let skillResult = await pool.query('SELECT id FROM skills WHERE name = $1', [skillName]);
      
      if (skillResult.rows.length === 0) {
        skillResult = await pool.query(
          'INSERT INTO skills (name, category) VALUES ($1, $2) RETURNING id',
          [skillName, '網頁開發']
        );
      }
      
      const skillId = skillResult.rows[0].id;
      
      // Add skill to expert
      await pool.query(`
        INSERT INTO expert_skills (expert_id, skill_id, proficiency_level)
        VALUES ($1, $2, $3)
        ON CONFLICT (expert_id, skill_id) DO UPDATE SET
          proficiency_level = $3
      `, [user.id, skillId, 4]);
    }
    
    console.log('✅ Skills added:', skills.join(', '));
    
    // Update user profile completion
    await pool.query(
      'UPDATE users SET profile_complete = $1 WHERE id = $2',
      [85, user.id]
    );
    
    console.log('✅ Profile completion updated to 85%');
    console.log('🎉 Expert profile setup completed!');

  } catch (error) {
    console.error('❌ Error creating expert profile:', error);
  } finally {
    await pool.end();
  }
}

createExpertProfile();
