-- Add availability status to expert profiles
-- This script adds availability status field for experts

-- Add availability_status column to expert_profiles table
ALTER TABLE expert_profiles ADD COLUMN IF NOT EXISTS availability_status VARCHAR(20) DEFAULT 'available' CHECK (availability_status IN ('available', 'busy'));

-- Update existing expert profiles to have 'available' status
UPDATE expert_profiles SET availability_status = 'available' WHERE availability_status IS NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_expert_profiles_availability ON expert_profiles(availability_status);
