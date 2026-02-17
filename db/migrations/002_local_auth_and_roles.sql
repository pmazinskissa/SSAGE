-- Migration: Local Auth + Role Management
-- Adds password_hash for local authentication, makes OAuth columns nullable,
-- and adds 'dev_admin' role to the role hierarchy.

-- 1. Add password_hash column (nullable — only set for local users)
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- 2. Make OAuth columns nullable so local users don't need them
ALTER TABLE users ALTER COLUMN oauth_provider DROP NOT NULL;
ALTER TABLE users ALTER COLUMN oauth_subject_id DROP NOT NULL;

-- 3. Update role CHECK constraint to include dev_admin
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('learner', 'admin', 'dev_admin'));

-- 4. Update pre_enrolled_users role CHECK to include dev_admin
ALTER TABLE pre_enrolled_users DROP CONSTRAINT IF EXISTS pre_enrolled_users_role_check;
ALTER TABLE pre_enrolled_users ADD CONSTRAINT pre_enrolled_users_role_check CHECK (role IN ('learner', 'admin', 'dev_admin'));

-- 5. Drop the unique constraint on oauth columns so local users with NULL values don't conflict
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_oauth_provider_oauth_subject_id_key;
-- Re-add as a partial unique index (only for non-null oauth entries)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_oauth_unique
  ON users (oauth_provider, oauth_subject_id)
  WHERE oauth_provider IS NOT NULL AND oauth_subject_id IS NOT NULL;
