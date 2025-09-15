-- Add admin support to the database
-- This script adds admin user type and creates admin account

-- First, update the user_type constraint to include 'admin'
ALTER TABLE users DROP CONSTRAINT users_user_type_check;
ALTER TABLE users ADD CONSTRAINT users_user_type_check CHECK (user_type IN ('expert', 'client', 'admin'));

-- Create admin account for professor.cat.hk@gmail.com
INSERT INTO users (
    email, 
    password_hash, 
    name, 
    user_type, 
    phone, 
    bio, 
    verified, 
    created_at
) VALUES (
    'professor.cat.hk@gmail.com',
    'admin_password_hash', -- In production, use proper password hashing
    'Admin Professor',
    'admin',
    '+852-1234-5678',
    'Platform Administrator',
    true,
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    user_type = 'admin',
    verified = true,
    updated_at = NOW();

-- Create admin verification log table
CREATE TABLE IF NOT EXISTS admin_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- 'verify', 'unverify', 'approve', 'reject'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add index for admin verifications
CREATE INDEX IF NOT EXISTS idx_admin_verifications_admin ON admin_verifications(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_verifications_user ON admin_verifications(user_id);
