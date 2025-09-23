-- Allow duplicate display names and speed up name searches

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Drop unique constraint if present (safe in idempotent environments)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_name_key;

-- Add trigram index for fast ILIKE searches on name
CREATE INDEX IF NOT EXISTS idx_profiles_name_trgm ON profiles USING gin (name gin_trgm_ops);

-- Optional lower(name) index to help exact/starts-with case-insensitive lookups
CREATE INDEX IF NOT EXISTS idx_profiles_name_lower ON profiles (lower(name));



