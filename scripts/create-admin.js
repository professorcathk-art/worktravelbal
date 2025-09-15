// Script to create admin account
const { Pool } = require('pg');

// Database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_fzBCE2NK8ydi@ep-floral-fog-a1bvk2px-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

async function createAdminAccount() {
  try {
    console.log('Creating admin account for professor.cat.hk@gmail.com...');
    
    // Check if admin already exists
    const existingAdmin = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      ['professor.cat.hk@gmail.com']
    );

    if (existingAdmin.rows.length > 0) {
      console.log('Admin account already exists. Updating to admin role...');
      
      // Update existing user to admin
      await pool.query(
        'UPDATE users SET user_type = $1, verified = $2 WHERE email = $3',
        ['admin', true, 'professor.cat.hk@gmail.com']
      );
      
      console.log('✅ Admin account updated successfully!');
    } else {
      // Create new admin user
      const result = await pool.query(`
        INSERT INTO users (
          email, password_hash, name, user_type, phone, bio, verified, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING *
      `, [
        'professor.cat.hk@gmail.com',
        'admin_password_hash', // In production, use proper password hashing
        'Admin Professor',
        'admin',
        '+852-1234-5678',
        'Platform Administrator',
        true
      ]);

      console.log('✅ Admin account created successfully!');
      console.log('Admin ID:', result.rows[0].id);
    }

    // Verify the admin account
    const adminUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      ['professor.cat.hk@gmail.com']
    );

    console.log('Admin account details:');
    console.log('- Email:', adminUser.rows[0].email);
    console.log('- Name:', adminUser.rows[0].name);
    console.log('- Type:', adminUser.rows[0].user_type);
    console.log('- Verified:', adminUser.rows[0].verified);

  } catch (error) {
    console.error('❌ Error creating admin account:', error);
  } finally {
    await pool.end();
  }
}

createAdminAccount();
