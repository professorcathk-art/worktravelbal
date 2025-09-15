-- Create messages table for communication between clients and experts
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    expert_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    read_at TIMESTAMP NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_expert_id ON messages(expert_id);
CREATE INDEX IF NOT EXISTS idx_messages_client_id ON messages(client_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Insert common languages (table already exists)
INSERT INTO languages (name, code) VALUES 
    ('中文', 'zh'), ('英文', 'en'), ('日文', 'ja'), ('韓文', 'ko'), ('法文', 'fr'), ('德文', 'de'), ('西班牙文', 'es')
ON CONFLICT (name) DO NOTHING;

-- Create expert_languages junction table
CREATE TABLE IF NOT EXISTS expert_languages (
    id SERIAL PRIMARY KEY,
    expert_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    language_id UUID NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
    proficiency_level VARCHAR(20) DEFAULT 'intermediate',
    UNIQUE(expert_id, language_id)
);

-- Create index for expert_languages
CREATE INDEX IF NOT EXISTS idx_expert_languages_expert_id ON expert_languages(expert_id);
CREATE INDEX IF NOT EXISTS idx_expert_languages_language_id ON expert_languages(language_id);
