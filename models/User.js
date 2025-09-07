// User model for the digital nomad platform
const { query } = require('../config/database');

class User {
  constructor(userData) {
    this.id = userData.id;
    this.email = userData.email;
    this.name = userData.name;
    this.userType = userData.user_type;
    this.phone = userData.phone;
    this.bio = userData.bio;
    this.avatarUrl = userData.avatar_url;
    this.verified = userData.verified;
    this.profileComplete = userData.profile_complete;
    this.createdAt = userData.created_at;
    this.updatedAt = userData.updated_at;
  }

  // Create a new user
  static async create(userData) {
    const { email, passwordHash, name, userType, phone, bio } = userData;
    
    const result = await query(
      `INSERT INTO users (email, password_hash, name, user_type, phone, bio)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [email, passwordHash, name, userType, phone, bio]
    );
    
    return new User(result.rows[0]);
  }

  // Find user by email
  static async findByEmail(email) {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    return result.rows.length > 0 ? new User(result.rows[0]) : null;
  }

  // Find user by ID
  static async findById(id) {
    const result = await query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    
    return result.rows.length > 0 ? new User(result.rows[0]) : null;
  }

  // Update user profile
  async update(updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updateData)) {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (fields.length === 0) return this;

    values.push(this.id);
    const queryText = `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING *`;
    
    const result = await query(queryText, values);
    return new User(result.rows[0]);
  }

  // Get expert profile if user is an expert
  async getExpertProfile() {
    if (this.userType !== 'expert') return null;
    
    const result = await query(
      `SELECT ep.*, 
              ARRAY_AGG(DISTINCT s.name) as skills,
              ARRAY_AGG(DISTINCT l.name) as languages
       FROM expert_profiles ep
       LEFT JOIN expert_skills es ON ep.user_id = es.expert_id
       LEFT JOIN skills s ON es.skill_id = s.id
       LEFT JOIN expert_languages el ON ep.user_id = el.expert_id
       LEFT JOIN languages l ON el.language_id = l.id
       WHERE ep.user_id = $1
       GROUP BY ep.id`,
      [this.id]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Get client profile if user is a client
  async getClientProfile() {
    if (this.userType !== 'client') return null;
    
    const result = await query(
      'SELECT * FROM client_profiles WHERE user_id = $1',
      [this.id]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Get user's applications
  async getApplications() {
    const result = await query(
      `SELECT a.*, t.title, t.budget_min, t.budget_max, t.currency
       FROM applications a
       JOIN tasks t ON a.task_id = t.id
       WHERE a.expert_id = $1
       ORDER BY a.created_at DESC`,
      [this.id]
    );
    
    return result.rows;
  }

  // Get user's posted tasks (for clients)
  async getPostedTasks() {
    if (this.userType !== 'client') return [];
    
    const result = await query(
      `SELECT t.*, tc.name as category_name,
              COUNT(a.id) as applications_count
       FROM tasks t
       LEFT JOIN task_categories tc ON t.category_id = tc.id
       LEFT JOIN applications a ON t.id = a.task_id
       WHERE t.client_id = $1
       GROUP BY t.id, tc.name
       ORDER BY t.created_at DESC`,
      [this.id]
    );
    
    return result.rows;
  }

  // Get saved tasks
  async getSavedTasks() {
    const result = await query(
      `SELECT t.*, tc.name as category_name
       FROM saved_tasks st
       JOIN tasks t ON st.task_id = t.id
       LEFT JOIN task_categories tc ON t.category_id = tc.id
       WHERE st.user_id = $1
       ORDER BY st.created_at DESC`,
      [this.id]
    );
    
    return result.rows;
  }

  // Save a task
  async saveTask(taskId) {
    await query(
      'INSERT INTO saved_tasks (user_id, task_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [this.id, taskId]
    );
  }

  // Remove saved task
  async unsaveTask(taskId) {
    await query(
      'DELETE FROM saved_tasks WHERE user_id = $1 AND task_id = $2',
      [this.id, taskId]
    );
  }

  // Check if task is saved
  async isTaskSaved(taskId) {
    const result = await query(
      'SELECT id FROM saved_tasks WHERE user_id = $1 AND task_id = $2',
      [this.id, taskId]
    );
    
    return result.rows.length > 0;
  }
}

module.exports = User;
