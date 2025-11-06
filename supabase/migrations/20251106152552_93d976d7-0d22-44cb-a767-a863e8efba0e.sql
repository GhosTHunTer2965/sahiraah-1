-- Add stripe_session_id column to expert_sessions table to track Stripe checkout sessions
ALTER TABLE expert_sessions 
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;