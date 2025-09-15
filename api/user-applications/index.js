// API endpoint to get applications by a specific user
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
      const { user_id } = req.query;
      
      if (!user_id) {
        return res.status(400).json({ error: 'user_id is required' });
      }

      console.log('Fetching applications for user:', user_id);

      // Get applications by this user with task details
      const result = await pool.query(`
        SELECT 
          a.*,
          t.title as task_title,
          t.description as task_description,
          t.budget_min,
          t.budget_max,
          t.currency,
          t.status as task_status,
          t.created_at as task_created_at,
          tc.name as category_name,
          u.name as client_name,
          u.email as client_email
        FROM applications a
        JOIN tasks t ON a.task_id = t.id
        LEFT JOIN task_categories tc ON t.category_id = tc.id
        LEFT JOIN users u ON t.client_id = u.id
        WHERE a.expert_id = $1
        ORDER BY a.created_at DESC
      `, [user_id]);
      
      console.log('Found', result.rows.length, 'applications for user');
      res.status(200).json(result.rows);
      
    } catch (error) {
      console.error('Error fetching user applications:', error);
      res.status(500).json({ 
        error: 'Failed to fetch user applications',
        details: error.message
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
