// API endpoint to get saved tasks by a specific user
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

      console.log('Fetching saved tasks for user:', user_id);

      // Get saved tasks by this user with task details
      const result = await pool.query(`
        SELECT 
          st.*,
          t.title,
          t.description,
          t.budget_min,
          t.budget_max,
          t.currency,
          t.status,
          t.duration,
          t.experience_level,
          t.remote,
          t.deadline,
          t.created_at as task_created_at,
          tc.name as category_name,
          u.name as client_name,
          u.email as client_email,
          COUNT(a.id) as application_count
        FROM saved_tasks st
        JOIN tasks t ON st.task_id = t.id
        LEFT JOIN task_categories tc ON t.category_id = tc.id
        LEFT JOIN users u ON t.client_id = u.id
        LEFT JOIN applications a ON t.id = a.task_id
        WHERE st.user_id = $1
        GROUP BY st.id, t.id, tc.name, u.name, u.email
        ORDER BY st.created_at DESC
      `, [user_id]);
      
      console.log('Found', result.rows.length, 'saved tasks for user');
      res.status(200).json(result.rows);
      
    } catch (error) {
      console.error('Error fetching user saved tasks:', error);
      res.status(500).json({ 
        error: 'Failed to fetch user saved tasks',
        details: error.message
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
