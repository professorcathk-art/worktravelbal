// Vercel API endpoint for saved tasks
const { Pool } = require('pg');

// Database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_fzBCE2NK8ydi@ep-floral-fog-a1bvk2px-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    // Get saved tasks for a user
    try {
      const { user_id } = req.query;
      
      if (!user_id) {
        return res.status(400).json({ error: 'user_id is required' });
      }

      console.log('Fetching saved tasks for user:', user_id);

      // Get saved tasks with full task details
      const result = await pool.query(`
        SELECT 
          st.*,
          t.title,
          t.description,
          t.budget_min,
          t.budget_max,
          t.duration,
          t.experience_level,
          t.deadline,
          t.status as task_status,
          t.created_at as task_created_at,
          tc.name as category_name,
          u.name as client_name,
          u.company as client_company,
          ARRAY_AGG(DISTINCT s.name) as skills
        FROM saved_tasks st
        JOIN tasks t ON st.task_id = t.id
        LEFT JOIN task_categories tc ON t.category_id = tc.id
        LEFT JOIN users u ON t.client_id = u.id
        LEFT JOIN task_skills ts ON t.id = ts.task_id
        LEFT JOIN skills s ON ts.skill_id = s.id
        WHERE st.user_id = $1
        GROUP BY st.id, t.id, tc.name, u.name, u.company
        ORDER BY st.created_at DESC
      `, [user_id]);
      
      console.log('Found', result.rows.length, 'saved tasks for user');
      res.status(200).json(result.rows);
      
    } catch (error) {
      console.error('Error fetching saved tasks:', error);
      res.status(500).json({ 
        error: 'Failed to fetch saved tasks',
        details: error.message
      });
    }
  } else if (req.method === 'POST') {
    // Save a task for a user
    try {
      const { user_id, task_id } = req.body;
      
      if (!user_id || !task_id) {
        return res.status(400).json({ error: 'user_id and task_id are required' });
      }

      console.log('Saving task for user:', user_id, 'task:', task_id);

      // Check if already saved
      const existing = await pool.query(
        'SELECT id FROM saved_tasks WHERE user_id = $1 AND task_id = $2',
        [user_id, task_id]
      );

      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'Task already saved' });
      }

      // Save the task
      const result = await pool.query(`
        INSERT INTO saved_tasks (user_id, task_id, created_at)
        VALUES ($1, $2, NOW())
        RETURNING *
      `, [user_id, task_id]);

      console.log('Task saved successfully:', result.rows[0].id);
      res.status(201).json({
        message: 'Task saved successfully',
        saved_task: result.rows[0]
      });

    } catch (error) {
      console.error('Error saving task:', error);
      res.status(500).json({ 
        error: 'Failed to save task',
        details: error.message
      });
    }
  } else if (req.method === 'DELETE') {
    // Unsave a task for a user
    try {
      const { user_id, task_id } = req.query;
      
      if (!user_id || !task_id) {
        return res.status(400).json({ error: 'user_id and task_id are required' });
      }

      console.log('Unsaving task for user:', user_id, 'task:', task_id);

      // Remove the saved task
      const result = await pool.query(
        'DELETE FROM saved_tasks WHERE user_id = $1 AND task_id = $2 RETURNING *',
        [user_id, task_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Saved task not found' });
      }

      console.log('Task unsaved successfully');
      res.status(200).json({
        message: 'Task unsaved successfully'
      });

    } catch (error) {
      console.error('Error unsaving task:', error);
      res.status(500).json({ 
        error: 'Failed to unsave task',
        details: error.message
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
