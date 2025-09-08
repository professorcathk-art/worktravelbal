-- Add interview tracking fields to applications table
-- This migration adds fields to track interview scheduling and completion

ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS interview_date DATE,
ADD COLUMN IF NOT EXISTS interview_time TIME,
ADD COLUMN IF NOT EXISTS interview_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS interview_location TEXT,
ADD COLUMN IF NOT EXISTS interview_notes TEXT;

-- Update the status constraint to include new interview statuses
ALTER TABLE applications 
DROP CONSTRAINT IF EXISTS applications_status_check;

ALTER TABLE applications 
ADD CONSTRAINT applications_status_check 
CHECK (status IN ('pending', 'interview_scheduled', 'interview_completed', 'accepted', 'rejected', 'withdrawn'));
