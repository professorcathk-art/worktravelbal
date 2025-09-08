// API endpoint to get tasks posted by a specific client
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
      const { client_id } = req.query;
      
      if (!client_id) {
        return res.status(400).json({ error: 'client_id is required' });
      }

      console.log('Fetching tasks for client:', client_id);

      // Get tasks posted by this client with application counts
      const result = await pool.query(`
        SELECT 
          t.*,
          tc.name as category_name,
          COUNT(a.id) as application_count,
          ARRAY_AGG(DISTINCT s.name) as skills
        FROM tasks t
        LEFT JOIN task_categories tc ON t.category_id = tc.id
        LEFT JOIN applications a ON t.id = a.task_id
        LEFT JOIN task_skills ts ON t.id = ts.task_id
        LEFT JOIN skills s ON ts.skill_id = s.id
        WHERE t.client_id = $1
        GROUP BY t.id, tc.name
        ORDER BY t.created_at DESC
      `, [client_id]);
      
      console.log('Found', result.rows.length, 'tasks for client');
      res.status(200).json(result.rows);
      
    } catch (error) {
      console.error('Error fetching client tasks:', error);
      res.status(500).json({ 
        error: 'Failed to fetch tasks',
        details: error.message
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
