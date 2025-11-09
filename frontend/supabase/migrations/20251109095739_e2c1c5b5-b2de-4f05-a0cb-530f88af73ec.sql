-- Add new columns to profiles table for crypto tokenomics
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS wallet_address text,
ADD COLUMN IF NOT EXISTS current_cycle_start timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS levels_completed_in_cycle integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS streak_start_date timestamp with time zone;

-- Create vibe_rewards table to track lesson completion cycle payouts
CREATE TABLE IF NOT EXISTS vibe_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  cycle_number integer NOT NULL,
  cycle_start_date timestamp with time zone NOT NULL,
  cycle_end_date timestamp with time zone NOT NULL,
  levels_completed integer NOT NULL DEFAULT 0,
  amount_vibe integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'no_wallet')),
  tx_hash text,
  created_at timestamp with time zone DEFAULT now(),
  paid_at timestamp with time zone
);

-- Enable RLS on vibe_rewards
ALTER TABLE vibe_rewards ENABLE ROW LEVEL SECURITY;

-- RLS policies for vibe_rewards
CREATE POLICY "Users can view their own rewards"
ON vibe_rewards FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own rewards"
ON vibe_rewards FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rewards"
ON vibe_rewards FOR UPDATE
USING (auth.uid() = user_id);

-- Create daily_checkins table for accurate streak tracking
CREATE TABLE IF NOT EXISTS daily_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  checkin_date date NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, checkin_date)
);

-- Enable RLS on daily_checkins
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;

-- RLS policies for daily_checkins
CREATE POLICY "Users can view their own checkins"
ON daily_checkins FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own checkins"
ON daily_checkins FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_vibe_rewards_user_status ON vibe_rewards(user_id, status);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_date ON daily_checkins(user_id, checkin_date);
CREATE INDEX IF NOT EXISTS idx_vibe_rewards_status ON vibe_rewards(status) WHERE status = 'pending';