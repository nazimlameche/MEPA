-- Migration 002 — Update user roles & schema fixes
-- AI-Edu platform — CNIL compliant

-- Drop old role constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users DROP CONSTRAINT IF EXISTS "CHK_users_role";

-- Make role nullable (Google OAuth users have no role until onboarding)
ALTER TABLE users ALTER COLUMN role DROP DEFAULT;
ALTER TABLE users ALTER COLUMN role DROP NOT NULL;

-- Make birth_year nullable (Google OAuth users provide it during onboarding)
ALTER TABLE users ALTER COLUMN birth_year DROP NOT NULL;

-- Add provider column
ALTER TABLE users ADD COLUMN IF NOT EXISTS provider VARCHAR(20) NOT NULL DEFAULT 'credentials';

-- Add parent_email column if missing
ALTER TABLE users ADD COLUMN IF NOT EXISTS parent_email VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS consent_date TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS age_group VARCHAR(20);

-- Migrate existing roles to new values
UPDATE users SET role = 'enseignant' WHERE role = 'teacher';
UPDATE users SET role = 'autre'      WHERE role = 'student';

-- Add new role constraint
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IS NULL OR role IN ('collegien', 'lyceen', 'enseignant', 'professionnel', 'autre', 'admin'));

-- Fix user_progress table: drop FK so course_id can be a string slug
ALTER TABLE user_progress DROP CONSTRAINT IF EXISTS user_progress_course_id_fkey;
ALTER TABLE user_progress DROP CONSTRAINT IF EXISTS "FK_user_progress_course_id";

-- Change course_id from UUID to VARCHAR to accept string slugs like 'intro-ia'
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_progress' AND column_name = 'course_id'
      AND data_type = 'uuid'
  ) THEN
    ALTER TABLE user_progress ALTER COLUMN course_id TYPE VARCHAR(100) USING course_id::TEXT;
  END IF;
END $$;

-- Add current_block column for position restore
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS current_block SMALLINT NOT NULL DEFAULT 0;

-- user_stats table (created by TypeORM synchronize — ensure it exists)
CREATE TABLE IF NOT EXISTS user_stats (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id            UUID NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
  total_xp           INTEGER NOT NULL DEFAULT 0,
  level              INTEGER NOT NULL DEFAULT 1,
  current_streak     INTEGER NOT NULL DEFAULT 0,
  longest_streak     INTEGER NOT NULL DEFAULT 0,
  completed_courses  INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats (user_id);
