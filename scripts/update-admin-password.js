// Script to update admin password
const { Pool } = require('pg');

// Database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_fzBCE2NK8ydi@ep-floral-fog-a1bvk2px-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

async function updateAdminPassword() {
  try {
    console.log('Updating admin password...');
    
    // Set a secure password for the admin account
    const newPassword = 'Admin123!@#'; // You can change this to whatever you prefer
    const passwordHash = Buffer.from(newPassword).toString('base64'); // Simple encoding for demo
    
    // Update the admin password
    const result = await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE email = $2 RETURNING *',
      [passwordHash, 'professor.cat.hk@gmail.com']
    );
    
    if (result.rows.length > 0) {
      console.log('✅ Admin password updated successfully!');
      console.log('Admin login details:');
      console.log('- Email: professor.cat.hk@gmail.com');
      console.log('- Password: ' + newPassword);
      console.log('- Note: This password is stored in the database and can be changed anytime');
    } else {
      console.log('❌ Admin account not found');
    }

  } catch (error) {
    console.error('❌ Error updating admin password:', error);
  } finally {
    await pool.end();
  }
}

updateAdminPassword();
