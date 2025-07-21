-- Fix Verification Queue View
-- Created: January 2025
-- Purpose: Fix the verification_queue view to ensure proper id column access

-- Drop existing view if it exists
DROP VIEW IF EXISTS verification_queue;

-- Recreate the verification_queue view with explicit column aliases
CREATE VIEW verification_queue AS
SELECT 
  u.id::uuid as id,
  u.username::text as username,
  u.email::text as email,
  u.role::text as role,
  u.created_at as registered_at,
  u.verification_submitted_at,
  u.is_verified,
  u.verification_status,
  u.verification_notes,
  u.verified_at,
  COALESCE(
    CASE 
      WHEN u.role = 'lady' THEN (
        SELECT COUNT(*)::integer FROM lady_verification_documents 
        WHERE lady_id = u.id AND verification_status = 'pending'
      )
      WHEN u.role = 'club' THEN (
        SELECT COUNT(*)::integer FROM club_verification_documents 
        WHERE club_id = u.id AND verification_status = 'pending'
      )
      WHEN u.role = 'client' THEN (
        SELECT COUNT(*)::integer FROM client_verification_documents 
        WHERE client_id = u.id AND verification_status = 'pending'
      )
      ELSE 0
    END, 0
  ) as pending_documents,
  COALESCE(
    CASE 
      WHEN u.role = 'lady' THEN (
        SELECT COUNT(*)::integer FROM lady_verification_documents 
        WHERE lady_id = u.id AND upload_status = 'success'
      )
      WHEN u.role = 'club' THEN (
        SELECT COUNT(*)::integer FROM club_verification_documents 
        WHERE club_id = u.id AND upload_status = 'success'
      )
      WHEN u.role = 'client' THEN (
        SELECT COUNT(*)::integer FROM client_verification_documents 
        WHERE client_id = u.id AND upload_status = 'success'
      )
      ELSE 0
    END, 0
  ) as total_documents_uploaded,
  CASE 
    WHEN u.role = 'lady' THEN 4
    WHEN u.role = 'club' THEN 3  
    WHEN u.role = 'client' THEN 2
    ELSE 0
  END as required_documents,
  -- Calculate priority score
  COALESCE(
    CASE 
      WHEN u.verification_submitted_at IS NULL THEN 0
      ELSE GREATEST(0, 100 - EXTRACT(HOURS FROM (NOW() - u.verification_submitted_at))::integer)
    END, 0
  ) as priority_score,
  -- Calculate completion percentage
  COALESCE(
    CASE 
      WHEN u.role = 'lady' THEN ROUND(
        (SELECT COUNT(*)::numeric FROM lady_verification_documents 
         WHERE lady_id = u.id AND upload_status = 'success') * 100.0 / 4
      )::integer
      WHEN u.role = 'club' THEN ROUND(
        (SELECT COUNT(*)::numeric FROM club_verification_documents 
         WHERE club_id = u.id AND upload_status = 'success') * 100.0 / 3
      )::integer
      WHEN u.role = 'client' THEN ROUND(
        (SELECT COUNT(*)::numeric FROM client_verification_documents 
         WHERE client_id = u.id AND upload_status = 'success') * 100.0 / 2
      )::integer
      ELSE 0
    END, 0
  ) as completion_percentage
FROM users u
WHERE u.role IN ('lady', 'club', 'client') 
  AND u.id IS NOT NULL
  AND u.username IS NOT NULL
  AND u.email IS NOT NULL
  AND (u.is_verified = false OR u.verification_status != 'verified' OR u.verification_status IS NULL)
ORDER BY u.verification_submitted_at ASC NULLS LAST;

-- Grant necessary permissions
GRANT SELECT ON verification_queue TO authenticated;
GRANT SELECT ON verification_queue TO anon; 