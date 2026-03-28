-- CareerLens Database Migrations
-- Run via: psql $DATABASE_URL -f db/migrations.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- Resume Scores
CREATE TABLE IF NOT EXISTS resume_scores (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES users(id) ON DELETE CASCADE,
  resume_text      TEXT,
  jd_text          TEXT,
  score            FLOAT,
  matched_keywords JSONB,
  missing_keywords JSONB,
  job_role         VARCHAR(100),
  created_at       TIMESTAMP DEFAULT NOW()
);

-- Culture Fit Results
CREATE TABLE IF NOT EXISTS culture_results (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  answers    JSONB NOT NULL,
  result     JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Roadmap Tasks
CREATE TABLE IF NOT EXISTS roadmap_tasks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  category   VARCHAR(50),
  task       TEXT NOT NULL,
  priority   VARCHAR(20) DEFAULT 'medium',
  status     VARCHAR(20) DEFAULT 'Todo',
  day_target INT CHECK (day_target IN (30, 60, 90)),
  created_at TIMESTAMP DEFAULT NOW()
);
