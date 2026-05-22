-- Migration 001 — Initial schema
-- AI-Edu platform — CNIL compliant

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email            TEXT NOT NULL UNIQUE,         -- CNIL: PII — never send to LLM
  password_hash    TEXT NOT NULL,
  role             VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
  birth_year       INTEGER NOT NULL,             -- CNIL: determines parental consent requirement
  consent_given    BOOLEAN NOT NULL DEFAULT FALSE,
  parental_consent BOOLEAN NOT NULL DEFAULT FALSE, -- CNIL: required when birth_year < current_year - 15
  xp               INTEGER NOT NULL DEFAULT 0,
  level            INTEGER NOT NULL DEFAULT 1,
  streak_days      INTEGER NOT NULL DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role  ON users (role);

-- ============================================================
-- COURSES
-- ============================================================
CREATE TABLE IF NOT EXISTS courses (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id      TEXT NOT NULL,
  title          TEXT NOT NULL,
  level          VARCHAR(20) NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  tier           VARCHAR(20) NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'premium')),
  content_blocks JSONB NOT NULL DEFAULT '[]',
  xp_reward      INTEGER NOT NULL DEFAULT 50,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_courses_module_id ON courses (module_id);
CREATE INDEX IF NOT EXISTS idx_courses_level     ON courses (level);
CREATE INDEX IF NOT EXISTS idx_courses_active    ON courses (is_active);

-- ============================================================
-- COURSE TAGS (many-to-many)
-- ============================================================
CREATE TABLE IF NOT EXISTS course_tags (
  course_id UUID NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
  tag       TEXT NOT NULL,
  PRIMARY KEY (course_id, tag)
);

-- ============================================================
-- EXERCISES
-- ============================================================
CREATE TABLE IF NOT EXISTS exercises (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id       UUID NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
  type            VARCHAR(50) NOT NULL,
  instructions    TEXT NOT NULL,
  expected_output TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exercises_course_id ON exercises (course_id);

-- ============================================================
-- USER PROGRESS
-- ============================================================
CREATE TABLE IF NOT EXISTS user_progress (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  course_id    UUID NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
  status       VARCHAR(20) NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  score        INTEGER NOT NULL DEFAULT 0,
  xp_earned    INTEGER NOT NULL DEFAULT 0,
  streak_count INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_user_progress_user_id   ON user_progress (user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_course_id ON user_progress (course_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_status    ON user_progress (status);

-- ============================================================
-- QUIZ ATTEMPTS
-- ============================================================
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises (id) ON DELETE CASCADE,
  answer      TEXT NOT NULL,
  is_correct  BOOLEAN NOT NULL DEFAULT FALSE,
  xp_earned   INTEGER NOT NULL DEFAULT 0,
  feedback    TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id    ON quiz_attempts (user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_exercise_id ON quiz_attempts (exercise_id);

-- ============================================================
-- SANDBOX SESSIONS
-- CNIL: messages are AES-256 encrypted, TTL 30 days
-- ============================================================
CREATE TABLE IF NOT EXISTS sandbox_sessions (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  messages   JSONB NOT NULL DEFAULT '[]',  -- CNIL: encrypted AES-256 at application layer
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 days',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sandbox_sessions_user_id    ON sandbox_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_sandbox_sessions_expires_at ON sandbox_sessions (expires_at);

-- ============================================================
-- GENERATED COURSES
-- CNIL: interests must be anonymized — no PII
-- ============================================================
CREATE TABLE IF NOT EXISTS generated_courses (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id   UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  interests JSONB NOT NULL DEFAULT '[]',  -- CNIL: anonymized interests, no PII
  content   JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_generated_courses_user_id ON generated_courses (user_id);

-- ============================================================
-- AUDIT LOGS
-- CNIL: ip_hash is SHA-256(ip) — raw IP never stored
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES users (id) ON DELETE SET NULL,
  action     TEXT NOT NULL,
  resource   TEXT NOT NULL,
  ip_hash    TEXT NOT NULL,  -- CNIL: always SHA-256(ip), never raw IP
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id    ON audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs (created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action     ON audit_logs (action);

-- ============================================================
-- UPDATED_AT triggers
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
