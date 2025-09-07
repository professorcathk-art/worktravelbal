// Simple database setup script for Neon
const { Pool } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_fzBCE2NK8ydi@ep-floral-fog-a1bvk2px-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function setupDatabase() {
  const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔄 Connecting to Neon database...');
    const client = await pool.connect();
    console.log('✅ Connected successfully!');

    // Create tables one by one
    console.log('🔄 Creating users table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        user_type VARCHAR(20) CHECK (user_type IN ('expert', 'client')) NOT NULL,
        phone VARCHAR(50),
        bio TEXT,
        avatar_url VARCHAR(500),
        verified BOOLEAN DEFAULT FALSE,
        profile_complete INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('🔄 Creating skills table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS skills (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) UNIQUE NOT NULL,
        category VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('🔄 Creating expert_profiles table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS expert_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        hourly_rate VARCHAR(50),
        current_location VARCHAR(255),
        timezone VARCHAR(50),
        rating DECIMAL(3,2) DEFAULT 0,
        reviews_count INTEGER DEFAULT 0,
        response_time VARCHAR(50),
        availability VARCHAR(100),
        completed_projects INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('🔄 Creating expert_skills table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS expert_skills (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        expert_id UUID REFERENCES users(id) ON DELETE CASCADE,
        skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
        proficiency_level INTEGER CHECK (proficiency_level BETWEEN 1 AND 5),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(expert_id, skill_id)
      )
    `);

    console.log('🔄 Creating task_categories table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS task_categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) UNIQUE NOT NULL,
        icon VARCHAR(10),
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('🔄 Creating tasks table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        client_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        budget_min INTEGER,
        budget_max INTEGER,
        currency VARCHAR(10) DEFAULT 'USD',
        duration VARCHAR(100),
        category_id UUID REFERENCES task_categories(id),
        experience_level VARCHAR(50),
        remote BOOLEAN DEFAULT TRUE,
        timezone VARCHAR(50),
        deadline DATE,
        status VARCHAR(20) CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')) DEFAULT 'open',
        applications_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('🔄 Creating applications table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
        expert_id UUID REFERENCES users(id) ON DELETE CASCADE,
        proposal_text TEXT NOT NULL,
        bid_amount INTEGER NOT NULL,
        delivery_time INTEGER NOT NULL,
        portfolio_link VARCHAR(500),
        status VARCHAR(20) CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')) DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(task_id, expert_id)
      )
    `);

    console.log('🔄 Creating destinations table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS destinations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        country VARCHAR(100) NOT NULL,
        nomad_count INTEGER DEFAULT 0,
        avg_cost_min INTEGER,
        avg_cost_max INTEGER,
        currency VARCHAR(10) DEFAULT 'USD',
        wifi_quality VARCHAR(50),
        coworking_spaces INTEGER DEFAULT 0,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('🔄 Creating saved_tasks table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS saved_tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, task_id)
      )
    `);

    // Insert initial data
    console.log('🔄 Inserting initial data...');
    
    // Insert task categories
    try {
      await client.query(`
        INSERT INTO task_categories (name, icon, description) VALUES
        ('網頁開發', '💻', '網站和應用程式開發服務'),
        ('平面設計', '🎨', '視覺設計和創意服務'),
        ('數位行銷', '📱', '行銷策略和廣告服務'),
        ('內容創作', '✍️', '文案撰寫和內容製作'),
        ('商業顧問', '💼', '商業策略和諮詢服務'),
        ('UI/UX設計', '🖌️', '使用者介面和體驗設計'),
        ('資料分析', '📊', '數據分析和洞察服務'),
        ('影片製作', '🎬', '影片製作和編輯服務')
      `);
    } catch (error) {
      console.log('Task categories already exist, skipping...');
    }

    // Insert skills
    try {
      await client.query(`
        INSERT INTO skills (name, category) VALUES
        ('React', '網頁開發'),
        ('Node.js', '網頁開發'),
        ('Python', '網頁開發'),
        ('JavaScript', '網頁開發'),
        ('TypeScript', '網頁開發'),
        ('AWS', '網頁開發'),
        ('Figma', 'UI/UX設計'),
        ('Adobe Creative Suite', '平面設計'),
        ('使用者研究', 'UI/UX設計'),
        ('原型設計', 'UI/UX設計'),
        ('Google Ads', '數位行銷'),
        ('Facebook廣告', '數位行銷'),
        ('SEO', '數位行銷'),
        ('內容行銷', '數位行銷'),
        ('內容策略', '內容創作'),
        ('文案撰寫', '內容創作'),
        ('部落格寫作', '內容創作'),
        ('社群經營', '內容創作'),
        ('策略規劃', '商業顧問'),
        ('市場分析', '商業顧問'),
        ('營運優化', '商業顧問'),
        ('財務規劃', '商業顧問')
      `);
    } catch (error) {
      console.log('Skills already exist, skipping...');
    }

    // Insert destinations
    try {
      await client.query(`
        INSERT INTO destinations (name, country, nomad_count, avg_cost_min, avg_cost_max, wifi_quality, coworking_spaces, description) VALUES
        ('峇里島', '印尼', 234, 800, 1200, '優秀', 45, '數位遊牧天堂，低生活成本配合高品質網路'),
        ('清邁', '泰國', 189, 600, 1000, '優秀', 38, '傳統數位遊牧基地，完善的基礎設施'),
        ('里斯本', '葡萄牙', 156, 1200, 1800, '優秀', 52, '歐洲數位遊牧熱點，溫和氣候和豐富文化'),
        ('墨西哥城', '墨西哥', 143, 700, 1100, '良好', 29, '拉丁美洲的數位遊牧中心，文化豐富'),
        ('杜拜', '阿聯', 98, 2000, 3500, '優秀', 67, '中東商業中心，現代化設施和免稅環境')
      `);
    } catch (error) {
      console.log('Destinations already exist, skipping...');
    }

    client.release();
    console.log('🎉 Database setup completed successfully!');
    console.log('✅ Your Neon database is ready to use');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

setupDatabase()
  .then(() => {
    console.log('✅ Setup complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });
