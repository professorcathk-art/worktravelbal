// API endpoint for users (login, register, get user by email)
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
    // Get user by email or get verified experts
    try {
      const { email, type } = req.query;
      
      if (email) {
        // Get user by email
        console.log('Fetching user by email:', email);

        const result = await pool.query(
          'SELECT * FROM users WHERE email = $1',
          [email]
        );
        
        console.log('Found', result.rows.length, 'users with email');
        res.status(200).json(result.rows);
        
      } else if (type === 'verified_experts') {
        // Get verified experts for the experts section
        console.log('Fetching verified experts');
        
        const { skill_filter, language_filter, rate_filter } = req.query;
        
        let query = `
          SELECT 
            u.id,
            u.email,
            u.name,
            u.user_type,
            u.verified,
            u.created_at,
            ep.hourly_rate,
            ep.current_location,
            ep.timezone,
            ep.rating,
            ep.reviews_count,
            ep.response_time,
            ep.availability,
            ep.completed_projects,
            ep.availability_status,
            ARRAY_AGG(DISTINCT s.name) as skills
          FROM users u
          LEFT JOIN expert_profiles ep ON u.id = ep.user_id
          LEFT JOIN expert_skills es ON u.id = es.expert_id
          LEFT JOIN skills s ON es.skill_id = s.id
          WHERE u.user_type = 'expert' AND u.verified = true
        `;
        
        const queryParams = [];
        let paramCount = 0;
        
        // Add skill filter
        if (skill_filter) {
          paramCount++;
          query += ` AND s.name = $${paramCount}`;
          queryParams.push(skill_filter);
        }
        
        // Add language filter
        if (language_filter) {
          paramCount++;
          query += ` AND EXISTS (
            SELECT 1 FROM expert_languages el 
            JOIN languages l ON el.language_id = l.id 
            WHERE el.expert_id = u.id AND l.name = $${paramCount}
          )`;
          queryParams.push(language_filter);
        }
        
        // Add rate filter
        if (rate_filter) {
          const rateRanges = {
            'low': 'ep.hourly_rate::int <= 30',
            'medium': 'ep.hourly_rate::int BETWEEN 31 AND 60',
            'high': 'ep.hourly_rate::int > 60'
          };
          if (rateRanges[rate_filter]) {
            query += ` AND ${rateRanges[rate_filter]}`;
          }
        }
        
        query += `
          GROUP BY u.id, ep.hourly_rate, ep.current_location, ep.timezone, ep.rating, ep.reviews_count, ep.response_time, ep.availability, ep.completed_projects, ep.availability_status
          ORDER BY u.created_at DESC
        `;

        const result = await pool.query(query, queryParams);
        
        console.log('Found', result.rows.length, 'verified experts');
        res.status(200).json(result.rows);
        
      } else {
        return res.status(400).json({ error: 'email or type parameter is required' });
      }
      
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ 
        error: 'Failed to fetch user',
        details: error.message
      });
    }
  } else if (req.method === 'POST') {
    // Create a new user
    try {
      const {
        email,
        password_hash,
        name,
        user_type,
        phone,
        bio
      } = req.body;

      console.log('Creating user with data:', {
        email,
        name,
        user_type
      });

      // Validate required fields
      if (!email || !password_hash || !name || !user_type) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if user already exists
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      // Create the user
      const result = await pool.query(`
        INSERT INTO users (
          email, password_hash, name, user_type, phone, bio, verified, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING *
      `, [
        email, password_hash, name, user_type, phone || null, bio || null, true
      ]);

      console.log('User created successfully:', result.rows[0].id);
      res.status(201).json({
        message: 'User created successfully',
        user: result.rows[0]
      });

    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ 
        error: 'Failed to create user',
        details: error.message
      });
    }
  } else if (req.method === 'PATCH') {
    // Update user profile information
    try {
      const { user_id, availability_status, name, location, hourlyRate, avatar, companySize, industry, phone, wechat, line, businessLicense } = req.body;
      
      if (!user_id) {
        return res.status(400).json({ error: 'user_id is required' });
      }

      console.log('Updating user profile for user:', user_id, 'with data:', { availability_status, name, location, hourlyRate, avatar });

      // Update user basic information
      if (name || location || phone || wechat || line || businessLicense) {
        const userUpdateFields = [];
        const userUpdateValues = [];
        let paramIndex = 1;

        if (name) {
          userUpdateFields.push(`name = $${paramIndex++}`);
          userUpdateValues.push(name);
        }
        if (location) {
          userUpdateFields.push(`location = $${paramIndex++}`);
          userUpdateValues.push(location);
        }
        if (phone) {
          userUpdateFields.push(`phone = $${paramIndex++}`);
          userUpdateValues.push(phone);
        }
        if (wechat) {
          userUpdateFields.push(`wechat = $${paramIndex++}`);
          userUpdateValues.push(wechat);
        }
        if (line) {
          userUpdateFields.push(`line = $${paramIndex++}`);
          userUpdateValues.push(line);
        }
        if (businessLicense) {
          userUpdateFields.push(`business_license_url = $${paramIndex++}`);
          userUpdateValues.push('uploaded'); // Placeholder for now
        }

        if (userUpdateFields.length > 0) {
          userUpdateValues.push(user_id);
          await pool.query(`
            UPDATE users 
            SET ${userUpdateFields.join(', ')}, updated_at = NOW()
            WHERE id = $${paramIndex}
          `, userUpdateValues);
        }
      }

      // Update expert profile information
      if (availability_status || hourlyRate || avatar) {
        const expertUpdateFields = [];
        const expertUpdateValues = [];
        let paramIndex = 1;

        if (availability_status) {
          if (!['available', 'busy'].includes(availability_status)) {
            return res.status(400).json({ error: 'availability_status must be "available" or "busy"' });
          }
          expertUpdateFields.push(`availability_status = $${paramIndex++}`);
          expertUpdateValues.push(availability_status);
        }
        if (hourlyRate) {
          expertUpdateFields.push(`hourly_rate = $${paramIndex++}`);
          expertUpdateValues.push(hourlyRate);
        }
        if (avatar) {
          expertUpdateFields.push(`avatar_url = $${paramIndex++}`);
          expertUpdateValues.push('uploaded'); // Placeholder for now
        }

        if (expertUpdateFields.length > 0) {
          expertUpdateValues.push(user_id);
          await pool.query(`
            INSERT INTO expert_profiles (user_id, ${expertUpdateFields.map(field => field.split(' = ')[0]).join(', ')}, updated_at)
            VALUES ($${paramIndex}, ${expertUpdateFields.map((_, i) => `$${i + 1}`).join(', ')}, NOW())
            ON CONFLICT (user_id) 
            DO UPDATE SET 
              ${expertUpdateFields.join(', ')},
              updated_at = NOW()
          `, expertUpdateValues);
        }
      }

      // Update client profile information
      if (companySize || industry) {
        const clientUpdateFields = [];
        const clientUpdateValues = [];
        let paramIndex = 1;

        if (companySize) {
          clientUpdateFields.push(`company_size = $${paramIndex++}`);
          clientUpdateValues.push(companySize);
        }
        if (industry) {
          clientUpdateFields.push(`industry = $${paramIndex++}`);
          clientUpdateValues.push(industry);
        }

        if (clientUpdateFields.length > 0) {
          clientUpdateValues.push(user_id);
          await pool.query(`
            INSERT INTO client_profiles (user_id, ${clientUpdateFields.map(field => field.split(' = ')[0]).join(', ')}, updated_at)
            VALUES ($${paramIndex}, ${clientUpdateFields.map((_, i) => `$${i + 1}`).join(', ')}, NOW())
            ON CONFLICT (user_id) 
            DO UPDATE SET 
              ${clientUpdateFields.join(', ')},
              updated_at = NOW()
          `, clientUpdateValues);
        }
      }

      console.log('User profile updated successfully');
      res.status(200).json({
        message: 'User profile updated successfully'
      });

    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ 
        error: 'Failed to update user profile',
        details: error.message
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
