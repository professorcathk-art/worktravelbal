// Script to setup admin functionality
const { Pool } = require('pg');

// Database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_fzBCE2NK8ydi@ep-floral-fog-a1bvk2px-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

async function setupAdmin() {
  try {
    console.log('Setting up admin functionality...');
    
    // 1. Update user_type constraint to include 'admin'
    console.log('1. Updating user_type constraint...');
    await pool.query('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_user_type_check');
    await pool.query('ALTER TABLE users ADD CONSTRAINT users_user_type_check CHECK (user_type IN (\'expert\', \'client\', \'admin\'))');
    console.log('✅ User type constraint updated');

    // 2. Create admin account
    console.log('2. Creating admin account...');
    const adminResult = await pool.query(`
      INSERT INTO users (
        email, password_hash, name, user_type, phone, bio, verified, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (email) DO UPDATE SET
        user_type = 'admin',
        verified = true,
        updated_at = NOW()
      RETURNING *
    `, [
      'professor.cat.hk@gmail.com',
      'admin_password_hash',
      'Admin Professor',
      'admin',
      '+852-1234-5678',
      'Platform Administrator',
      true
    ]);
    console.log('✅ Admin account created/updated');

    // 3. Create admin verification log table
    console.log('3. Creating admin verification log table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_verifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        admin_id UUID REFERENCES users(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        action VARCHAR(50) NOT NULL,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Admin verification table created');

    // 4. Add indexes
    console.log('4. Adding indexes...');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_admin_verifications_admin ON admin_verifications(admin_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_admin_verifications_user ON admin_verifications(user_id)');
    console.log('✅ Indexes created');

    // 5. Verify admin account
    const adminUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      ['professor.cat.hk@gmail.com']
    );

    console.log('\n🎉 Admin setup completed successfully!');
    console.log('Admin account details:');
    console.log('- Email:', adminUser.rows[0].email);
    console.log('- Name:', adminUser.rows[0].name);
    console.log('- Type:', adminUser.rows[0].user_type);
    console.log('- Verified:', adminUser.rows[0].verified);
    console.log('- ID:', adminUser.rows[0].id);

  } catch (error) {
    console.error('❌ Error setting up admin:', error);
  } finally {
    await pool.end();
  }
}

setupAdmin();
