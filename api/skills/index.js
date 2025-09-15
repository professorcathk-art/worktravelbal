// API endpoint to get all skills
const { Pool } = require('pg');

// Database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_fzBCE2NK8ydi@ep-floral-fog-a1bvk2px-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      console.log('Fetching all skills...');

      // Get all skills with usage count (how many experts have this skill)
      const result = await pool.query(`
        SELECT 
          s.id,
          s.name,
          s.category,
          COUNT(es.expert_id) as expert_count
        FROM skills s
        LEFT JOIN expert_skills es ON s.id = es.skill_id
        LEFT JOIN users u ON es.expert_id = u.id AND u.user_type = 'expert' AND u.verified = true
        GROUP BY s.id, s.name, s.category
        HAVING COUNT(es.expert_id) > 0
        ORDER BY expert_count DESC, s.name ASC
      `);
      
      console.log('Found', result.rows.length, 'skills with experts');
      res.status(200).json(result.rows);
      
    } catch (error) {
      console.error('Error fetching skills:', error);
      res.status(500).json({ 
        error: 'Failed to fetch skills',
        details: error.message
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
