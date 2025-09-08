// API endpoint to get applications for a specific task
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
      const { task_id } = req.query;
      
      if (!task_id) {
        return res.status(400).json({ error: 'task_id is required' });
      }

      console.log('Fetching applications for task:', task_id);

      // Get applications for this task with expert details
      const result = await pool.query(`
        SELECT 
          a.*,
          u.name as expert_name,
          u.email as expert_email,
          u.avatar as expert_avatar,
          u.bio as expert_bio,
          ep.hourly_rate,
          ep.rating,
          ep.reviews_count,
          ep.completed_projects,
          ARRAY_AGG(DISTINCT s.name) as expert_skills
        FROM applications a
        JOIN users u ON a.expert_id = u.id
        LEFT JOIN expert_profiles ep ON u.id = ep.user_id
        LEFT JOIN expert_skills es ON u.id = es.expert_id
        LEFT JOIN skills s ON es.skill_id = s.id
        WHERE a.task_id = $1
        GROUP BY a.id, u.id, ep.id
        ORDER BY a.created_at DESC
      `, [task_id]);
      
      console.log('Found', result.rows.length, 'applications for task');
      res.status(200).json(result.rows);
      
    } catch (error) {
      console.error('Error fetching task applications:', error);
      res.status(500).json({ 
        error: 'Failed to fetch applications',
        details: error.message
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
