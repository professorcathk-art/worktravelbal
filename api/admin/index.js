// Admin API endpoint for user management and verification
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

  try {
    // Verify admin access (in production, use proper authentication)
    const { admin_email } = req.query;
    if (!admin_email || admin_email !== 'professor.cat.hk@gmail.com') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    if (req.method === 'GET') {
      // Get all users for admin review
      const { action } = req.query;
      
      if (action === 'users') {
        const result = await pool.query(`
          SELECT 
            u.id,
            u.email,
            u.name,
            u.user_type,
            u.verified,
            u.created_at,
            u.profile_complete,
            ep.hourly_rate,
            ep.current_location,
            ep.rating,
            ep.completed_projects,
            cp.company_size,
            cp.industry
          FROM users u
          LEFT JOIN expert_profiles ep ON u.id = ep.user_id
          LEFT JOIN client_profiles cp ON u.id = cp.user_id
          WHERE u.user_type != 'admin'
          ORDER BY u.created_at DESC
        `);
        
        res.status(200).json(result.rows);
      } else if (action === 'unverified') {
        // Get unverified users
        const result = await pool.query(`
          SELECT 
            u.id,
            u.email,
            u.name,
            u.user_type,
            u.verified,
            u.created_at,
            u.profile_complete
          FROM users u
          WHERE u.verified = false AND u.user_type != 'admin'
          ORDER BY u.created_at DESC
        `);
        
        res.status(200).json(result.rows);
      } else {
        res.status(400).json({ error: 'Invalid action' });
      }

    } else if (req.method === 'PATCH') {
      // Verify/unverify users
      const { user_id, action, notes } = req.body;
      
      if (!user_id || !action) {
        return res.status(400).json({ error: 'user_id and action are required' });
      }

      if (action === 'verify') {
        // Verify user
        await pool.query(
          'UPDATE users SET verified = true, updated_at = NOW() WHERE id = $1',
          [user_id]
        );
        
        // Log verification
        await pool.query(`
          INSERT INTO admin_verifications (admin_id, user_id, action, notes)
          VALUES (
            (SELECT id FROM users WHERE email = $1),
            $2,
            'verify',
            $3
          )
        `, [admin_email, user_id, notes || 'User verified by admin']);
        
        res.status(200).json({ message: 'User verified successfully' });
        
      } else if (action === 'unverify') {
        // Unverify user
        await pool.query(
          'UPDATE users SET verified = false, updated_at = NOW() WHERE id = $1',
          [user_id]
        );
        
        // Log unverification
        await pool.query(`
          INSERT INTO admin_verifications (admin_id, user_id, action, notes)
          VALUES (
            (SELECT id FROM users WHERE email = $1),
            $2,
            'unverify',
            $3
          )
        `, [admin_email, user_id, notes || 'User unverified by admin']);
        
        res.status(200).json({ message: 'User unverified successfully' });
        
      } else {
        res.status(400).json({ error: 'Invalid action. Use "verify" or "unverify"' });
      }

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Admin API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
};
