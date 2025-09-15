// API endpoint for messages between clients and experts
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
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    // Send a new message
    try {
      const {
        expert_id,
        client_id,
        content
      } = req.body;

      console.log('Creating message with data:', {
        expert_id,
        client_id,
        content: content.substring(0, 50) + '...'
      });

      // Validate required fields
      if (!expert_id || !client_id || !content) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Create the message
      const result = await pool.query(`
        INSERT INTO messages (
          expert_id, client_id, content, created_at
        ) VALUES ($1, $2, $3, NOW())
        RETURNING *
      `, [expert_id, client_id, content]);

      console.log('Message created successfully:', result.rows[0].id);
      res.status(201).json({
        message: 'Message sent successfully',
        message_data: result.rows[0]
      });

    } catch (error) {
      console.error('Error creating message:', error);
      res.status(500).json({ 
        error: 'Failed to send message',
        details: error.message
      });
    }
  } else if (req.method === 'GET') {
    // Get messages for a user
    try {
      const { user_id, user_type } = req.query;
      
      if (!user_id || !user_type) {
        return res.status(400).json({ error: 'user_id and user_type are required' });
      }

      console.log('Fetching messages for user:', user_id, 'type:', user_type);

      let query;
      let params;

      if (user_type === 'expert') {
        // Get messages received by expert
        query = `
          SELECT 
            m.*,
            u.name as sender_name,
            u.email as sender_email,
            u.company as sender_company
          FROM messages m
          JOIN users u ON m.client_id = u.id
          WHERE m.expert_id = $1
          ORDER BY m.created_at DESC
        `;
        params = [user_id];
      } else if (user_type === 'client') {
        // Get messages sent by client
        query = `
          SELECT 
            m.*,
            u.name as recipient_name,
            u.email as recipient_email
          FROM messages m
          JOIN users u ON m.expert_id = u.id
          WHERE m.client_id = $1
          ORDER BY m.created_at DESC
        `;
        params = [user_id];
      } else {
        return res.status(400).json({ error: 'Invalid user_type' });
      }

      const result = await pool.query(query, params);
      
      console.log('Found', result.rows.length, 'messages for user');
      res.status(200).json(result.rows);
      
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ 
        error: 'Failed to fetch messages',
        details: error.message
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
