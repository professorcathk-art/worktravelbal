-- Add missing columns to fix database schema issues

-- Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS wechat VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS line VARCHAR(100);

-- Add missing columns to expert_profiles table  
ALTER TABLE expert_profiles ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);
ALTER TABLE expert_profiles ADD COLUMN IF NOT EXISTS availability_status VARCHAR(20) CHECK (availability_status IN ('available', 'busy')) DEFAULT 'busy';

-- Update user_type constraint to include 'admin'
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_user_type_check;
ALTER TABLE users ADD CONSTRAINT users_user_type_check CHECK (user_type IN ('expert', 'client', 'admin'));

-- Update tasks table to include currency and status columns
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'USD';
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_status_check CHECK (status IN ('pending', 'open', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending';

-- Add missing columns to client_profiles table
ALTER TABLE client_profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE client_profiles ADD COLUMN IF NOT EXISTS wechat VARCHAR(100);
ALTER TABLE client_profiles ADD COLUMN IF NOT EXISTS line VARCHAR(100);
ALTER TABLE client_profiles ADD COLUMN IF NOT EXISTS business_license_url VARCHAR(500);
