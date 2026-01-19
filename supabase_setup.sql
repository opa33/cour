-- Courier Finance Database Setup
-- Run this SQL in Supabase SQL Editor to create all necessary tables

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  telegram_id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  settings JSONB DEFAULT '{}'::jsonb,
  leaderboard_opt_in BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create shifts table
CREATE TABLE IF NOT EXISTS shifts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id TEXT NOT NULL REFERENCES users(telegram_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  minutes INTEGER DEFAULT 0,
  zone1 INTEGER DEFAULT 0,
  zone2 INTEGER DEFAULT 0,
  zone3 INTEGER DEFAULT 0,
  kilometers INTEGER DEFAULT 0,
  "fuelCost" INTEGER DEFAULT 0,
  "timeIncome" INTEGER DEFAULT 0,
  "ordersIncome" INTEGER DEFAULT 0,
  "totalWithTax" INTEGER DEFAULT 0,
  "totalWithoutTax" INTEGER DEFAULT 0,
  "netProfit" INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(telegram_id, date)
);

-- Create leaderboard_cache table (for aggregated stats)
CREATE TABLE IF NOT EXISTS leaderboard_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id TEXT NOT NULL REFERENCES users(telegram_id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  period TEXT NOT NULL, -- 'day', 'week', 'month'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_earnings INTEGER DEFAULT 0,
  rank INTEGER,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(telegram_id, period, period_start)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_shifts_telegram_id ON shifts(telegram_id);
CREATE INDEX IF NOT EXISTS idx_shifts_date ON shifts(date);
CREATE INDEX IF NOT EXISTS idx_shifts_telegram_date ON shifts(telegram_id, date);
CREATE INDEX IF NOT EXISTS idx_leaderboard_period ON leaderboard_cache(period, period_start);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON leaderboard_cache(rank) WHERE rank IS NOT NULL;

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_cache ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public access (change if you need auth)
-- Users table: public read, own write
CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (true);
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (true);

-- Shifts table: public read, own write
CREATE POLICY "Shifts are viewable by everyone" ON shifts FOR SELECT USING (true);
CREATE POLICY "Users can insert own shifts" ON shifts FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own shifts" ON shifts FOR UPDATE USING (true);
CREATE POLICY "Users can delete own shifts" ON shifts FOR DELETE USING (true);

-- Leaderboard cache: public read only
CREATE POLICY "Leaderboard is public read only" ON leaderboard_cache FOR SELECT USING (true);
CREATE POLICY "Service can insert leaderboard data" ON leaderboard_cache FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can update leaderboard data" ON leaderboard_cache FOR UPDATE USING (true);

-- Grant permissions
GRANT SELECT ON users TO anon;
GRANT INSERT, UPDATE ON users TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON shifts TO anon;
GRANT SELECT ON leaderboard_cache TO anon;