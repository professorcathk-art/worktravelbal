-- Add interview-related columns to applications table
ALTER TABLE applications ADD COLUMN IF NOT EXISTS interview_date DATE;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS interview_time TIME;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS interview_type VARCHAR(50);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS interview_location VARCHAR(255);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS interview_notes TEXT;

-- Update status constraint to include interview_scheduled
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_status_check;
ALTER TABLE applications ADD CONSTRAINT applications_status_check 
    CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn', 'interview_scheduled'));

-- Create messages table for communication system
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    subject VARCHAR(255),
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'general', -- 'general', 'interview_invite', 'application_response'
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_task ON messages(task_id);
CREATE INDEX IF NOT EXISTS idx_messages_application ON messages(application_id);
