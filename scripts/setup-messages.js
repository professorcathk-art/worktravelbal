const { query, closePool } = require('../config/database');

async function setupMessages() {
  try {
    console.log('🔄 Setting up message tables...');
    
    // Create message_threads table
    await query(`
      CREATE TABLE IF NOT EXISTS message_threads (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          expert_id UUID NOT NULL REFERENCES users(id),
          corporate_id UUID NOT NULL REFERENCES users(id),
          task_id UUID REFERENCES tasks(id),
          title VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(expert_id, corporate_id, task_id)
      )
    `);
    console.log('✅ Created message_threads table');
    
    // Create messages table
    await query(`
      CREATE TABLE IF NOT EXISTS messages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          thread_id UUID NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
          sender_id UUID NOT NULL REFERENCES users(id),
          receiver_id UUID NOT NULL REFERENCES users(id),
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          is_read BOOLEAN DEFAULT FALSE
      )
    `);
    console.log('✅ Created messages table');
    
    // Create indexes
    await query('CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at)');
    await query('CREATE INDEX IF NOT EXISTS idx_message_threads_expert_id ON message_threads(expert_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_message_threads_corporate_id ON message_threads(corporate_id)');
    console.log('✅ Created indexes');
    
    console.log('🎉 Message tables setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error setting up message tables:', error);
  } finally {
    await closePool();
  }
}

setupMessages();