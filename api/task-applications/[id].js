// API endpoint for individual task application operations
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
  res.setHeader('Access-Control-Allow-Methods', 'GET,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Extract application ID from the URL
  const applicationId = req.query.id;

  if (!applicationId) {
    return res.status(400).json({ error: 'Application ID is required' });
  }

  if (req.method === 'PATCH') {
    // Update application status
    try {
      const { 
        status, 
        interview_date, 
        interview_time, 
        interview_type, 
        interview_location, 
        interview_notes 
      } = req.body;

      console.log('Updating application:', applicationId, 'with status:', status);

      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
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
  } else if (req.method === 'GET') {
    // Get specific application
    try {
      const result = await pool.query(`
        SELECT 
          a.*,
          u.name as expert_name,
          u.email as expert_email,
          ep.avatar_url as expert_avatar,
          u.bio as expert_bio,
          ep.hourly_rate,
          ep.rating,
          ep.reviews_count,
          ep.completed_projects,
          t.title as task_title,
          t.description as task_description
        FROM applications a
        JOIN users u ON a.expert_id = u.id
        LEFT JOIN expert_profiles ep ON u.id = ep.user_id
        JOIN tasks t ON a.task_id = t.id
        WHERE a.id = $1
      `, [applicationId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Application not found' });
      }
      
      res.status(200).json(result.rows[0]);
      
    } catch (error) {
      console.error('Error fetching application:', error);
      res.status(500).json({ 
        error: 'Failed to fetch application',
        details: error.message
      });
    }
  } else if (req.method === 'DELETE') {
    // Delete application
    try {
      const result = await pool.query(
        'DELETE FROM applications WHERE id = $1 RETURNING *',
        [applicationId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Application not found' });
      }

      console.log('Application deleted successfully');
      res.status(200).json({
        message: 'Application deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting application:', error);
      res.status(500).json({ 
        error: 'Failed to delete application',
        details: error.message
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
