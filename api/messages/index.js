const { Pool } = require('pg');
const pool = require('../../config/database');

module.exports = async (req, res) => {
  const { method } = req;
  
  try {
    switch (method) {
      case 'GET':
        // Get messages for a user
        const { user_id, thread_id } = req.query;
        
        if (thread_id) {
          // Get messages for a specific thread
          const result = await pool.query(`
            SELECT m.*, 
                   u1.name as sender_name,
                   u2.name as receiver_name
            FROM messages m
            LEFT JOIN users u1 ON m.sender_id = u1.id
            LEFT JOIN users u2 ON m.receiver_id = u2.id
            WHERE m.thread_id = $1
            ORDER BY m.created_at ASC
          `, [thread_id]);
          
          res.status(200).json(result.rows);
        } else if (user_id) {
          // Get all threads for a user
          const result = await pool.query(`
            SELECT DISTINCT t.*,
                   u1.name as expert_name,
                   u2.name as corporate_name,
                   (SELECT COUNT(*) FROM messages m WHERE m.thread_id = t.id AND m.receiver_id = $1 AND m.is_read = false) as unread_count,
                   (SELECT m.content FROM messages m WHERE m.thread_id = t.id ORDER BY m.created_at DESC LIMIT 1) as last_message,
                   (SELECT m.created_at FROM messages m WHERE m.thread_id = t.id ORDER BY m.created_at DESC LIMIT 1) as last_message_time
            FROM message_threads t
            LEFT JOIN users u1 ON t.expert_id = u1.id
            LEFT JOIN users u2 ON t.corporate_id = u2.id
            WHERE t.expert_id = $1 OR t.corporate_id = $1
            ORDER BY last_message_time DESC
          `, [user_id]);
          
          res.status(200).json(result.rows);
        } else {
          res.status(400).json({ error: 'user_id or thread_id is required' });
        }
        break;
        
      case 'POST':
        // Create a new message
        const { thread_id, sender_id, receiver_id, content } = req.body;
        
        if (!thread_id || !sender_id || !receiver_id || !content) {
          return res.status(400).json({ error: 'thread_id, sender_id, receiver_id, and content are required' });
        }
        
        const messageResult = await pool.query(`
          INSERT INTO messages (thread_id, sender_id, receiver_id, content, created_at, is_read)
          VALUES ($1, $2, $3, $4, NOW(), false)
          RETURNING *
        `, [thread_id, sender_id, receiver_id, content]);
        
        res.status(201).json(messageResult.rows[0]);
        break;
        
      case 'PATCH':
        // Mark messages as read
        const { message_ids } = req.body;
        
        if (!message_ids || !Array.isArray(message_ids)) {
          return res.status(400).json({ error: 'message_ids array is required' });
        }
        
        const updateResult = await pool.query(`
          UPDATE messages 
          SET is_read = true 
          WHERE id = ANY($1)
          RETURNING id
        `, [message_ids]);
        
        res.status(200).json({ updated_count: updateResult.rowCount });
        break;
        
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Messages API error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};
