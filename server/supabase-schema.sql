-- eLoktantra baseline schema (Phase 1 + Political Intelligence features)
-- Run this in Supabase SQL editor.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users / identity
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('CITIZEN', 'ADMIN', 'CANDIDATE')),
  constituency TEXT,
  password_hash TEXT NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_constituency ON users(constituency);

-- Candidate transparency
CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  party TEXT NOT NULL,
  constituency TEXT NOT NULL,
  education TEXT,
  "criminalCases" INTEGER DEFAULT 0 CHECK ("criminalCases" >= 0),
  assets NUMERIC(18, 2) DEFAULT 0 CHECK (assets >= 0),
  liabilities NUMERIC(18, 2) DEFAULT 0 CHECK (liabilities >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_candidates_constituency ON candidates(constituency);
CREATE INDEX IF NOT EXISTS idx_candidates_party ON candidates(party);

-- Manifesto intelligence
CREATE TABLE IF NOT EXISTS manifestos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  party TEXT NOT NULL,
  policy_category TEXT NOT NULL,
  policy_text TEXT NOT NULL,
  summary TEXT,
  election_year INTEGER,
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_manifestos_party ON manifestos(party);
CREATE INDEX IF NOT EXISTS idx_manifestos_category ON manifestos(policy_category);
CREATE INDEX IF NOT EXISTS idx_manifestos_year ON manifestos(election_year);

-- Elections and ballots
CREATE TABLE IF NOT EXISTS elections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  constituency TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'UPCOMING' CHECK (status IN ('UPCOMING', 'ACTIVE', 'COMPLETED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_elections_constituency ON elections(constituency);
CREATE INDEX IF NOT EXISTS idx_elections_status ON elections(status);

CREATE TABLE IF NOT EXISTS voting_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  voter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (voter_id, election_id)
);

CREATE INDEX IF NOT EXISTS idx_voting_tokens_election ON voting_tokens(election_id);

CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  token_id UUID NOT NULL UNIQUE REFERENCES voting_tokens(id) ON DELETE RESTRICT,
  encrypted_vote TEXT NOT NULL,
  blockchain_tx_hash TEXT NOT NULL UNIQUE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_votes_election ON votes(election_id);

-- Civic issue prioritization
CREATE TABLE IF NOT EXISTS issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location TEXT NOT NULL,
  constituency TEXT NOT NULL,
  issue_type TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED')),
  reported_by_uuid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_issues_constituency ON issues(constituency);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);

-- Promise tracker
CREATE TABLE IF NOT EXISTS promises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  constituency TEXT,
  target_date DATE,
  status TEXT NOT NULL DEFAULT 'NOT_STARTED' CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED')),
  progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  update_note TEXT,
  source_url TEXT,
  evidence_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promises_candidate ON promises(candidate_id);
CREATE INDEX IF NOT EXISTS idx_promises_status ON promises(status);
CREATE INDEX IF NOT EXISTS idx_promises_constituency ON promises(constituency);

-- Seed users
INSERT INTO users (id, name, email, role, constituency, password_hash, is_verified, status)
VALUES
  ('db7a4175-91fb-40d2-97ab-afaa1febdcdc', 'Demo Citizen', 'citizen@eloktantra.in', 'CITIZEN', 'Varanasi', '$2b$12$V3fY7S0XQO2U47R6qvmw0uVdZEAuD2j8xkB0P4uW3t5yVpYjM4bUq', true, 'ACTIVE'),
  ('b77b6393-45c7-4a77-a3ef-fdf9449db84f', 'Platform Admin', 'admin@eloktantra.in', 'ADMIN', 'Varanasi', '$2b$12$V3fY7S0XQO2U47R6qvmw0uVdZEAuD2j8xkB0P4uW3t5yVpYjM4bUq', true, 'ACTIVE')
ON CONFLICT (email) DO NOTHING;

-- Seed candidates
INSERT INTO candidates (id, name, party, constituency, education, "criminalCases", assets, liabilities)
VALUES
  ('c1111111-1111-1111-1111-111111111111', 'Narendra Modi', 'BJP', 'Varanasi', 'Post Graduate (MA)', 0, 30000000, 0),
  ('c2222222-2222-2222-2222-222222222222', 'Rahul Gandhi', 'INC', 'Wayanad', 'M.Phil', 5, 200000000, 2000000),
  ('c3333333-3333-3333-3333-333333333333', 'Arvind Kejriwal', 'AAP', 'New Delhi', 'B.Tech', 15, 34000000, 0),
  ('c4444444-4444-4444-4444-444444444444', 'Mamata Banerjee', 'AITC', 'Bhabanipur', 'MA, LLB', 0, 16000000, 0)
ON CONFLICT (id) DO NOTHING;

-- Seed active election
INSERT INTO elections (id, title, constituency, start_time, end_time, status)
VALUES
  ('e1111111-1111-1111-1111-111111111111', 'Varanasi General Election 2026', 'Varanasi', NOW() - INTERVAL '1 day', NOW() + INTERVAL '1 day', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- Seed manifesto examples
INSERT INTO manifestos (party, policy_category, policy_text, summary, election_year)
VALUES
  ('BJP', 'Economy', 'Focus on manufacturing growth, MSME financing, and logistics modernization with digital public infrastructure expansion.', 'Focus on manufacturing, MSME finance, logistics upgrades, and digital infrastructure growth.', 2026),
  ('INC', 'Economy', 'Prioritize jobs-led growth, social protection, and targeted tax reforms to improve middle-class and rural incomes.', 'Prioritizes jobs-led growth, social protection, and targeted tax reforms for income support.', 2026)
ON CONFLICT DO NOTHING;

-- Seed promise examples
INSERT INTO promises (candidate_id, title, description, constituency, status, progress_percentage)
VALUES
  ('c1111111-1111-1111-1111-111111111111', '24x7 Clean Water Coverage', 'Deliver continuous clean water supply in all urban wards and 80% rural households.', 'Varanasi', 'IN_PROGRESS', 45),
  ('c2222222-2222-2222-2222-222222222222', 'Constituency Youth Employment Plan', 'Launch local apprenticeship and startup grant pipeline for first-time job seekers.', 'Wayanad', 'NOT_STARTED', 0)
ON CONFLICT DO NOTHING;

-- Session control for secure voting
CREATE TABLE IF NOT EXISTS voting_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  voter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'TERMINATED', 'COMPLETED', 'BLOCKED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (voter_id, election_id)
);

CREATE INDEX IF NOT EXISTS idx_voting_sessions_voter_election ON voting_sessions(voter_id, election_id);
CREATE INDEX IF NOT EXISTS idx_voting_sessions_status ON voting_sessions(status);
