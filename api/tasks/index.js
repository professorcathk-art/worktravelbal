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
    // Get tasks (all or open only based on query parameter)
    try {
      console.log('Attempting to connect to database...');
      console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
      
      const showAll = req.query.all === 'true';
      const whereClause = showAll ? '' : "WHERE t.status = 'open'";
      
      const result = await pool.query(`
        SELECT t.*, tc.name as category_name, u.name as client_name,
               ARRAY_AGG(DISTINCT s.name) as skills,
               (SELECT COUNT(*) FROM applications a WHERE a.task_id = t.id) as applications_count
        FROM tasks t
        LEFT JOIN task_categories tc ON t.category_id = tc.id
        LEFT JOIN users u ON t.client_id = u.id
        LEFT JOIN task_skills ts ON t.id = ts.task_id
        LEFT JOIN skills s ON ts.skill_id = s.id
        ${whereClause}
        GROUP BY t.id, tc.name, u.name
        ORDER BY t.created_at DESC
      `);
      
      console.log('Query successful, found', result.rows.length, 'tasks');
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        detail: error.detail
      });
      res.status(500).json({ 
        error: 'Failed to fetch tasks',
        details: error.message,
        code: error.code
      });
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

      console.log('Creating task with data:', {
        title,
        category,
        budget_min,
        budget_max,
        deadline,
        client_id,
        skills_count: skills ? skills.length : 0
      });

      // Validate required fields
      if (!title || !category || !description || !budget_min || !budget_max || !client_id) {
        console.log('Validation failed - missing required fields');
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Validate client_id is a valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(client_id)) {
        console.log('Invalid client_id format:', client_id);
        return res.status(400).json({ error: 'Invalid client ID format' });
      }

      // Check if user exists, if not create a demo user
      let userResult = await pool.query('SELECT id FROM users WHERE id = $1', [client_id]);
      if (userResult.rows.length === 0) {
        console.log('User not found, creating demo user:', client_id);
        // Create a demo user for the task with unique email
        const demoEmail = `demo_${client_id.replace(/-/g, '')}@example.com`;
        try {
          await pool.query(`
            INSERT INTO users (id, email, password_hash, name, user_type, verified, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
          `, [
            client_id,
            demoEmail,
            'demo_hash',
            'Demo Client',
            'client',
            true
          ]);
          console.log('Demo user created successfully');
        } catch (userError) {
          console.error('Error creating demo user:', userError);
          // If user creation fails, try to find existing user with same email pattern
          const existingUserResult = await pool.query('SELECT id FROM users WHERE email = $1', [demoEmail]);
          if (existingUserResult.rows.length > 0) {
            console.log('Using existing demo user');
          } else {
            throw userError;
          }
        }
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

    // Handle empty deadline - convert empty string to null
    const deadlineValue = deadline && deadline.trim() !== '' ? deadline : null;

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
      duration, experience_level, deadlineValue, timezone,
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

    console.log('Task created successfully:', task.id);
    res.status(201).json({
      message: 'Task created successfully',
      task: task
    });

  } catch (error) {
    console.error('Error creating task:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
    res.status(500).json({ 
      error: 'Failed to create task',
      details: error.message,
      code: error.code
    });
  }
  } else if (req.method === 'PATCH') {
    // Update task status (for admin delisting/reactivating)
    try {
      const taskId = req.query.id;
      const { status } = req.body;

      if (!taskId) {
        return res.status(400).json({ error: 'Task ID is required' });
      }

      if (!status || !['open', 'cancelled', 'in_progress', 'completed'].includes(status)) {
        return res.status(400).json({ error: 'Valid status is required' });
      }

      // Update task status
      const result = await pool.query(
        'UPDATE tasks SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [status, taskId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }

      console.log('Task status updated:', taskId, 'to', status);
      res.status(200).json({
        message: 'Task status updated successfully',
        task: result.rows[0]
      });

    } catch (error) {
      console.error('Error updating task status:', error);
      res.status(500).json({ 
        error: 'Failed to update task status',
        details: error.message
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
