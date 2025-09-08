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
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
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
  } else if (req.method === 'POST') {
    // Submit a new application
    try {
      const {
        task_id,
        expert_id,
        proposal_text,
        bid_amount,
        delivery_time,
        portfolio_link
      } = req.body;

      console.log('Creating application with data:', {
        task_id,
        expert_id,
        bid_amount,
        delivery_time
      });

      // Validate required fields
      if (!task_id || !expert_id || !proposal_text || !bid_amount || !delivery_time) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if user already applied to this task
      const existingApplication = await pool.query(
        'SELECT id FROM applications WHERE task_id = $1 AND expert_id = $2',
        [task_id, expert_id]
      );

      if (existingApplication.rows.length > 0) {
        return res.status(400).json({ error: 'You have already applied to this task' });
      }

      // Create the application
      const result = await pool.query(`
        INSERT INTO applications (
          task_id, expert_id, proposal_text, bid_amount, 
          delivery_time, portfolio_link, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING *
      `, [
        task_id, expert_id, proposal_text, bid_amount,
        delivery_time, portfolio_link, 'pending'
      ]);

      console.log('Application created successfully:', result.rows[0].id);
      res.status(201).json({
        message: 'Application submitted successfully',
        application: result.rows[0]
      });

    } catch (error) {
      console.error('Error creating application:', error);
      res.status(500).json({ 
        error: 'Failed to submit application',
        details: error.message
      });
    }
  } else if (req.method === 'PATCH') {
    // Update application status
    try {
      const applicationId = req.url.split('/').pop();
      const { 
        status, 
        interview_date, 
        interview_time, 
        interview_type, 
        interview_location, 
        interview_notes 
      } = req.body;

      console.log('Updating application:', applicationId, 'with status:', status);

      if (!applicationId || !status) {
        return res.status(400).json({ error: 'Application ID and status are required' });
      }

      // Build update query dynamically based on provided fields
      let updateFields = ['status = $2', 'updated_at = NOW()'];
      let values = [applicationId, status];
      let paramIndex = 3;

      if (interview_date) {
        updateFields.push(`interview_date = $${paramIndex++}`);
        values.push(interview_date);
      }
      if (interview_time) {
        updateFields.push(`interview_time = $${paramIndex++}`);
        values.push(interview_time);
      }
      if (interview_type) {
        updateFields.push(`interview_type = $${paramIndex++}`);
        values.push(interview_type);
      }
      if (interview_location) {
        updateFields.push(`interview_location = $${paramIndex++}`);
        values.push(interview_location);
      }
      if (interview_notes) {
        updateFields.push(`interview_notes = $${paramIndex++}`);
        values.push(interview_notes);
      }

      const result = await pool.query(`
        UPDATE applications 
        SET ${updateFields.join(', ')}
        WHERE id = $1
        RETURNING *
      `, values);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Application not found' });
      }

      console.log('Application updated successfully:', result.rows[0].id);
      res.status(200).json({
        message: 'Application updated successfully',
        application: result.rows[0]
      });

    } catch (error) {
      console.error('Error updating application:', error);
      res.status(500).json({ 
        error: 'Failed to update application',
        details: error.message
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
