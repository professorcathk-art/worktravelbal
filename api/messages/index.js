const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    // Get messages for a user
    try {
      const { user_id, task_id, application_id } = req.query;
      
      if (!user_id) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      let query = `
        SELECT 
          m.*,
          sender.name as sender_name,
          sender.email as sender_email,
          receiver.name as receiver_name,
          receiver.email as receiver_email,
          t.title as task_title
        FROM messages m
        LEFT JOIN users sender ON m.sender_id = sender.id
        LEFT JOIN users receiver ON m.receiver_id = receiver.id
        LEFT JOIN tasks t ON m.task_id = t.id
        WHERE m.receiver_id = $1 OR m.sender_id = $1
      `;
      
      let params = [user_id];
      let paramIndex = 2;

      if (task_id) {
        query += ` AND m.task_id = $${paramIndex++}`;
        params.push(task_id);
      }

      if (application_id) {
        query += ` AND m.application_id = $${paramIndex++}`;
        params.push(application_id);
      }

      query += ` ORDER BY m.created_at DESC`;

      const result = await pool.query(query, params);
      
      res.status(200).json({
        success: true,
        messages: result.rows
      });

    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ 
        error: 'Failed to fetch messages',
        details: error.message
      });
    }

  } else if (req.method === 'POST') {
    // Send a new message
    try {
      const { 
        sender_id, 
        receiver_id, 
        task_id, 
        application_id, 
        subject, 
        content, 
        message_type = 'general' 
      } = req.body;

      if (!sender_id || !receiver_id || !content) {
        return res.status(400).json({ error: 'Sender ID, receiver ID, and content are required' });
      }

      const query = `
        INSERT INTO messages (
          sender_id, receiver_id, task_id, application_id, 
          subject, content, message_type
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;

      const values = [sender_id, receiver_id, task_id, application_id, subject, content, message_type];
      const result = await pool.query(query, values);

      res.status(201).json({
        success: true,
        message: result.rows[0]
      });

    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ 
        error: 'Failed to send message',
        details: error.message
      });
    }

  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}