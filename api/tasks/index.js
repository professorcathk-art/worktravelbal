// Vercel API endpoint for tasks
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
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    // Get all tasks
    try {
      const result = await pool.query(`
        SELECT t.*, tc.name as category_name, u.name as client_name,
               ARRAY_AGG(DISTINCT s.name) as skills
        FROM tasks t
        LEFT JOIN task_categories tc ON t.category_id = tc.id
        LEFT JOIN users u ON t.client_id = u.id
        LEFT JOIN task_skills ts ON t.id = ts.task_id
        LEFT JOIN skills s ON ts.skill_id = s.id
        WHERE t.status = 'open'
        GROUP BY t.id, tc.name, u.name
        ORDER BY t.created_at DESC
      `);
      
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  } else if (req.method === 'POST') {
    // Create a new task
    try {
      const {
        title,
        category,
        description,
        budget_min,
        budget_max,
        duration,
        experience_level,
        deadline,
        timezone,
        skills,
        client_id,
        status
      } = req.body;

      // Validate required fields
      if (!title || !category || !description || !budget_min || !budget_max || !client_id) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // First, find or create the category
      let categoryResult = await pool.query('SELECT id FROM task_categories WHERE name = $1', [category]);
      let categoryId;
      
      if (categoryResult.rows.length === 0) {
        // Create new category if it doesn't exist
        const newCategoryResult = await pool.query(
          'INSERT INTO task_categories (name, created_at) VALUES ($1, NOW()) RETURNING id',
          [category]
        );
        categoryId = newCategoryResult.rows[0].id;
      } else {
        categoryId = categoryResult.rows[0].id;
      }

      // Insert task
      const taskResult = await pool.query(`
        INSERT INTO tasks (
          title, category_id, description, budget_min, budget_max, 
          duration, experience_level, deadline, timezone, 
          client_id, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
        RETURNING *
      `, [
        title, categoryId, description, budget_min, budget_max,
        duration, experience_level, deadline, timezone,
        client_id, status || 'open'
      ]);

      const task = taskResult.rows[0];

      // Insert skills if provided
      if (skills && skills.length > 0) {
        for (const skillName of skills) {
          // First, try to find existing skill
          let skillResult = await pool.query('SELECT id FROM skills WHERE name = $1', [skillName]);
          
          let skillId;
          if (skillResult.rows.length === 0) {
            // Create new skill if it doesn't exist
            const newSkillResult = await pool.query(
              'INSERT INTO skills (name, category, created_at) VALUES ($1, $2, NOW()) RETURNING id',
              [skillName, category]
            );
            skillId = newSkillResult.rows[0].id;
          } else {
            skillId = skillResult.rows[0].id;
          }

          // Link skill to task
          await pool.query(
            'INSERT INTO task_skills (task_id, skill_id, created_at) VALUES ($1, $2, NOW())',
            [task.id, skillId]
          );
        }
      }

      res.status(201).json({
        message: 'Task created successfully',
        task: task
      });

    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
