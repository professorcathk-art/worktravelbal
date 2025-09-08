// Database setup endpoint for production
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_fzBCE2NK8ydi@ep-floral-fog-a1bvk2px-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    console.log('Setting up database tables...');
    
    // Create tables one by one with IF NOT EXISTS
    const createTables = `
      -- Enable UUID extension
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('expert', 'client')),
          phone VARCHAR(20),
          bio TEXT,
          avatar VARCHAR(500),
          company VARCHAR(255),
          website VARCHAR(500),
          location VARCHAR(255),
          timezone VARCHAR(50),
          verified BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Expert profiles table
      CREATE TABLE IF NOT EXISTS expert_profiles (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          hourly_rate DECIMAL(10,2),
          current_location VARCHAR(255),
          rating DECIMAL(3,2) DEFAULT 0.0,
          reviews_count INTEGER DEFAULT 0,
          response_time VARCHAR(50),
          availability VARCHAR(50),
          completed_projects INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Client profiles table
      CREATE TABLE IF NOT EXISTS client_profiles (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          company_size VARCHAR(50),
          industry VARCHAR(255),
          budget_range VARCHAR(50),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Skills table
      CREATE TABLE IF NOT EXISTS skills (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(255) UNIQUE NOT NULL,
          category VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Expert skills table
      CREATE TABLE IF NOT EXISTS expert_skills (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          expert_id UUID REFERENCES users(id) ON DELETE CASCADE,
          skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
          proficiency_level INTEGER CHECK (proficiency_level BETWEEN 1 AND 5),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(expert_id, skill_id)
      );

      -- Languages table
      CREATE TABLE IF NOT EXISTS languages (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(100) UNIQUE NOT NULL,
          code VARCHAR(10) UNIQUE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Expert languages table
      CREATE TABLE IF NOT EXISTS expert_languages (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          expert_id UUID REFERENCES users(id) ON DELETE CASCADE,
          language_id UUID REFERENCES languages(id) ON DELETE CASCADE,
          proficiency_level VARCHAR(50),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(expert_id, language_id)
      );

      -- Task categories table
      CREATE TABLE IF NOT EXISTS task_categories (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(255) UNIQUE NOT NULL,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Tasks table
      CREATE TABLE IF NOT EXISTS tasks (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          client_id UUID REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(500) NOT NULL,
          description TEXT NOT NULL,
          budget_min DECIMAL(10,2),
          budget_max DECIMAL(10,2),
          currency VARCHAR(10) DEFAULT 'USD',
          duration VARCHAR(100),
          category_id UUID REFERENCES task_categories(id),
          experience_level VARCHAR(50),
          deadline DATE,
          timezone VARCHAR(50),
          status VARCHAR(50) DEFAULT 'open',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Task skills table
      CREATE TABLE IF NOT EXISTS task_skills (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
          skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(task_id, skill_id)
      );

      -- Applications table
      CREATE TABLE IF NOT EXISTS applications (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
          expert_id UUID REFERENCES users(id) ON DELETE CASCADE,
          proposal_text TEXT NOT NULL,
          bid_amount DECIMAL(10,2),
          delivery_time VARCHAR(100),
          portfolio_link VARCHAR(500),
          status VARCHAR(50) DEFAULT 'pending',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Destinations table
      CREATE TABLE IF NOT EXISTS destinations (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(255) UNIQUE NOT NULL,
          country VARCHAR(255) NOT NULL,
          nomad_count INTEGER DEFAULT 0,
          cost_of_living DECIMAL(10,2),
          internet_speed DECIMAL(5,2),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Saved tasks table
      CREATE TABLE IF NOT EXISTS saved_tasks (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, task_id)
      );
    `;
    
    await pool.query(createTables);
    console.log('Database tables created/verified successfully');
    
    // First, ensure destinations table has the right columns
    const alterDestinations = `
      ALTER TABLE destinations 
      ADD COLUMN IF NOT EXISTS cost_of_living DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS internet_speed DECIMAL(5,2);
    `;
    
    await pool.query(alterDestinations);
    console.log('Destinations table columns updated');

    // Insert initial data
    const initialData = `
      -- Insert initial task categories
      INSERT INTO task_categories (name, description, created_at) VALUES
      ('網頁開發', '網站和應用程式開發相關任務', NOW()),
      ('平面設計', '視覺設計和品牌設計任務', NOW()),
      ('數位行銷', '線上行銷和社群媒體管理', NOW()),
      ('內容創作', '文章撰寫和內容製作', NOW()),
      ('商業顧問', '商業策略和諮詢服務', NOW()),
      ('UI/UX設計', '使用者介面和體驗設計', NOW()),
      ('資料分析', '數據分析和商業智慧', NOW()),
      ('影片製作', '影片編輯和製作服務', NOW())
      ON CONFLICT (name) DO NOTHING;

      -- Insert initial skills
      INSERT INTO skills (name, category, created_at) VALUES
      ('JavaScript', '網頁開發', NOW()),
      ('React', '網頁開發', NOW()),
      ('Node.js', '網頁開發', NOW()),
      ('Python', '網頁開發', NOW()),
      ('Photoshop', '平面設計', NOW()),
      ('Illustrator', '平面設計', NOW()),
      ('Figma', 'UI/UX設計', NOW()),
      ('Sketch', 'UI/UX設計', NOW()),
      ('Google Analytics', '數位行銷', NOW()),
      ('Facebook Ads', '數位行銷', NOW()),
      ('Content Writing', '內容創作', NOW()),
      ('SEO', '內容創作', NOW()),
      ('Business Strategy', '商業顧問', NOW()),
      ('Market Research', '商業顧問', NOW()),
      ('Excel', '資料分析', NOW()),
      ('Tableau', '資料分析', NOW()),
      ('Premiere Pro', '影片製作', NOW()),
      ('After Effects', '影片製作', NOW())
      ON CONFLICT (name) DO NOTHING;
    `;
    
    await pool.query(initialData);
    console.log('Task categories and skills inserted successfully');

    // Insert destinations separately to handle column issues
    const destinationsData = `
      INSERT INTO destinations (name, country, nomad_count, cost_of_living, internet_speed, created_at) VALUES
      ('台北', '台灣', 1500, 1200, 85, NOW()),
      ('曼谷', '泰國', 8000, 800, 45, NOW()),
      ('清邁', '泰國', 12000, 600, 40, NOW()),
      ('峇里島', '印尼', 15000, 700, 35, NOW()),
      ('里斯本', '葡萄牙', 5000, 1000, 60, NOW()),
      ('巴塞隆納', '西班牙', 8000, 1100, 70, NOW()),
      ('柏林', '德國', 6000, 1200, 80, NOW()),
      ('阿姆斯特丹', '荷蘭', 4000, 1400, 90, NOW()),
      ('東京', '日本', 3000, 1800, 95, NOW()),
      ('首爾', '韓國', 2000, 1300, 90, NOW()),
      ('墨爾本', '澳洲', 4000, 1600, 85, NOW()),
      ('溫哥華', '加拿大', 3000, 1500, 80, NOW()),
      ('墨西哥城', '墨西哥', 5000, 900, 50, NOW()),
      ('布宜諾斯艾利斯', '阿根廷', 3000, 600, 40, NOW()),
      ('開普敦', '南非', 2000, 800, 45, NOW())
      ON CONFLICT (name) DO NOTHING;
    `;
    
    await pool.query(destinationsData);
    console.log('Destinations data inserted successfully');
    
    res.status(200).json({
      success: true,
      message: 'Database setup completed successfully',
      timestamp: new Date().toISOString(),
      tables_created: [
        'users', 'expert_profiles', 'client_profiles', 'skills', 'expert_skills',
        'languages', 'expert_languages', 'task_categories', 'tasks', 'task_skills',
        'applications', 'destinations', 'saved_tasks'
      ],
      initial_data_inserted: [
        'task_categories', 'skills', 'destinations'
      ]
    });
    
  } catch (error) {
    console.error('Database setup failed:', error);
    res.status(500).json({
      success: false,
      error: 'Database setup failed',
      message: error.message,
      code: error.code
    });
  }
};
