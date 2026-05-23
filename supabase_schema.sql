-- ══════════════════════════════════════════════════════════════
-- WikiRace Database Schema
-- Run this in Supabase SQL Editor
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  total_games INTEGER DEFAULT 0,
  best_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS game_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL,
  time_seconds INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  score INTEGER NOT NULL,
  from_article TEXT,
  to_article TEXT,
  mode TEXT DEFAULT 'classic',
  date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lobbies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  host TEXT NOT NULL,
  is_public BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'waiting',
  from_article TEXT,
  to_article TEXT,
  max_players INTEGER DEFAULT 8,
  players JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scores_mode ON game_scores(mode);
CREATE INDEX IF NOT EXISTS idx_scores_date ON game_scores(date);
CREATE INDEX IF NOT EXISTS idx_scores_score ON game_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_lobbies_code ON lobbies(code);
CREATE INDEX IF NOT EXISTS idx_lobbies_status ON lobbies(status);
CREATE INDEX IF NOT EXISTS idx_players_username ON players(username);

ALTER TABLE players DISABLE ROW LEVEL SECURITY;
ALTER TABLE game_scores DISABLE ROW LEVEL SECURITY;
ALTER TABLE lobbies DISABLE ROW LEVEL SECURITY;
