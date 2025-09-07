-- Digital Nomad Platform Database Schema
-- Created for Neon PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (experts and clients)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
);

-- Expert profiles
CREATE TABLE expert_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
);

-- Skills table
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Expert skills (many-to-many)
CREATE TABLE expert_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expert_id UUID REFERENCES users(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_level INTEGER CHECK (proficiency_level BETWEEN 1 AND 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(expert_id, skill_id)
);

-- Languages table
CREATE TABLE languages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    code VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Expert languages (many-to-many)
CREATE TABLE expert_languages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expert_id UUID REFERENCES users(id) ON DELETE CASCADE,
    language_id UUID REFERENCES languages(id) ON DELETE CASCADE,
    proficiency_level INTEGER CHECK (proficiency_level BETWEEN 1 AND 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(expert_id, language_id)
);

-- Client profiles
CREATE TABLE client_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company_size VARCHAR(50),
    industry VARCHAR(100),
    website VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Task categories
CREATE TABLE task_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(10),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tasks/Projects
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
);

-- Task skills (many-to-many)
CREATE TABLE task_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(task_id, skill_id)
);

-- Applications
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
);

-- Destinations
CREATE TABLE destinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
);

-- Coworking spaces
CREATE TABLE coworking_spaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    destination_id UUID REFERENCES destinations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    day_pass_price DECIMAL(10,2),
    monthly_pass_price DECIMAL(10,2),
    currency VARCHAR(10) DEFAULT 'USD',
    wifi_speed VARCHAR(50),
    amenities TEXT[],
    website VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reviews
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expert_id UUID REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES users(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Saved tasks (bookmarks)
CREATE TABLE saved_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, task_id)
);

-- Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type ON users(user_type);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_client ON tasks(client_id);
CREATE INDEX idx_applications_task ON applications(task_id);
CREATE INDEX idx_applications_expert ON applications(expert_id);
CREATE INDEX idx_expert_skills_expert ON expert_skills(expert_id);
CREATE INDEX idx_expert_languages_expert ON expert_languages(expert_id);

-- Insert initial data
INSERT INTO task_categories (name, icon, description) VALUES
('網頁開發', '💻', '網站和應用程式開發服務'),
('平面設計', '🎨', '視覺設計和創意服務'),
('數位行銷', '📱', '行銷策略和廣告服務'),
('內容創作', '✍️', '文案撰寫和內容製作'),
('商業顧問', '💼', '商業策略和諮詢服務'),
('UI/UX設計', '🖌️', '使用者介面和體驗設計'),
('資料分析', '📊', '數據分析和洞察服務'),
('影片製作', '🎬', '影片製作和編輯服務');

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
('財務規劃', '商業顧問');

INSERT INTO languages (name, code) VALUES
('中文', 'zh'),
('英文', 'en'),
('西班牙文', 'es'),
('法文', 'fr'),
('德文', 'de'),
('日文', 'ja'),
('韓文', 'ko'),
('泰文', 'th'),
('印尼文', 'id'),
('葡萄牙文', 'pt'),
('阿拉伯文', 'ar');

INSERT INTO destinations (name, country, nomad_count, avg_cost_min, avg_cost_max, wifi_quality, coworking_spaces, description) VALUES
('峇里島', '印尼', 234, 800, 1200, '優秀', 45, '數位遊牧天堂，低生活成本配合高品質網路'),
('清邁', '泰國', 189, 600, 1000, '優秀', 38, '傳統數位遊牧基地，完善的基礎設施'),
('里斯本', '葡萄牙', 156, 1200, 1800, '優秀', 52, '歐洲數位遊牧熱點，溫和氣候和豐富文化'),
('墨西哥城', '墨西哥', 143, 700, 1100, '良好', 29, '拉丁美洲的數位遊牧中心，文化豐富'),
('杜拜', '阿聯', 98, 2000, 3500, '優秀', 67, '中東商業中心，現代化設施和免稅環境'),
('布拉格', '捷克', 134, 900, 1400, '優秀', 41, '歐洲歷史名城，高品質生活和合理成本'),
('布宜諾斯艾利斯', '阿根廷', 87, 500, 900, '良好', 23, '南美文化之都，經濟實惠的歐洲風格生活');

INSERT INTO coworking_spaces (destination_id, name, location, day_pass_price, monthly_pass_price, wifi_speed, amenities, website) VALUES
((SELECT id FROM destinations WHERE name = '峇里島'), 'Hubud Bali', '烏布, 峇里島', 12.00, 150.00, '100Mbps', ARRAY['會議室', '咖啡吧', '屋頂花園', '活動空間'], 'https://hubud.org'),
((SELECT id FROM destinations WHERE name = '清邁'), 'CAMP Chiang Mai', '尼曼路, 清邁', 8.00, 120.00, '80Mbps', ARRAY['24小時開放', '影印設備', '休息區', '停車場'], 'https://camp.co.th'),
((SELECT id FROM destinations WHERE name = '里斯本'), 'Second Home Lisboa', '梅爾卡多, 里斯本', 25.00, 280.00, '200Mbps', ARRAY['植物牆', '健身房', '餐廳', '活動廳'], 'https://secondhome.io'),
((SELECT id FROM destinations WHERE name = '峇里島'), 'Dojo Bali', '長谷, 峇里島', 15.00, 180.00, '120Mbps', ARRAY['海景工作區', '瑜伽課程', '衝浪板租借', '有機餐廳'], 'https://dojobali.com'),
((SELECT id FROM destinations WHERE name = '清邁'), 'Punspace', '古城區, 清邁', 6.00, 100.00, '75Mbps', ARRAY['安靜工作區', '私人辦公室', '會議室', '廚房'], 'https://punspace.com');
