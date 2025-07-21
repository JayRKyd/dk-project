-- Client Verification System Migration
-- Created: January 2025
-- Purpose: Add client verification documents table and update verification queue

-- Create client_verification_documents table
CREATE TABLE client_verification_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('id_document', 'selfie_with_id')),
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER,
  file_type VARCHAR(100),
  upload_status VARCHAR(20) DEFAULT 'pending' CHECK (upload_status IN ('pending', 'success', 'error')),
  verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  verification_notes TEXT,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(client_id, document_type)
);

-- Add indexes for performance
CREATE INDEX idx_client_verification_docs_client_id ON client_verification_documents(client_id);
CREATE INDEX idx_client_verification_docs_status ON client_verification_documents(verification_status);
CREATE INDEX idx_client_verification_docs_type ON client_verification_documents(document_type);
CREATE INDEX idx_client_verification_docs_upload_status ON client_verification_documents(upload_status);

-- Add RLS policies for client_verification_documents
ALTER TABLE client_verification_documents ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own documents
CREATE POLICY "Users can view own verification documents" ON client_verification_documents
  FOR SELECT USING (auth.uid() = client_id);

-- Policy: Users can insert their own documents
CREATE POLICY "Users can insert own verification documents" ON client_verification_documents
  FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Policy: Users can update their own documents (for re-upload)
CREATE POLICY "Users can update own verification documents" ON client_verification_documents
  FOR UPDATE USING (auth.uid() = client_id);

-- Policy: Users can delete their own documents
CREATE POLICY "Users can delete own verification documents" ON client_verification_documents
  FOR DELETE USING (auth.uid() = client_id);

-- Policy: Admins can view all documents
CREATE POLICY "Admins can view all verification documents" ON client_verification_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Policy: Admins can update verification status
CREATE POLICY "Admins can update verification status" ON client_verification_documents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Update verification_queue view to include clients
DROP VIEW IF EXISTS verification_queue;

CREATE VIEW verification_queue AS
SELECT 
  u.id,
  u.username,
  u.email,
  u.role,
  u.created_at as registered_at,
  u.verification_submitted_at,
  u.is_verified,
  u.verification_status,
  u.verification_notes,
  u.verified_at,
  CASE 
    WHEN u.role = 'lady' THEN (
      SELECT COUNT(*) FROM lady_verification_documents 
      WHERE lady_id = u.id AND verification_status = 'pending'
    )
    WHEN u.role = 'club' THEN (
      SELECT COUNT(*) FROM club_verification_documents 
      WHERE club_id = u.id AND verification_status = 'pending'
    )
    WHEN u.role = 'client' THEN (
      SELECT COUNT(*) FROM client_verification_documents 
      WHERE client_id = u.id AND verification_status = 'pending'
    )
    ELSE 0
  END as pending_documents,
  CASE 
    WHEN u.role = 'lady' THEN (
      SELECT COUNT(*) FROM lady_verification_documents 
      WHERE lady_id = u.id AND upload_status = 'success'
    )
    WHEN u.role = 'club' THEN (
      SELECT COUNT(*) FROM club_verification_documents 
      WHERE club_id = u.id AND upload_status = 'success'
    )
    WHEN u.role = 'client' THEN (
      SELECT COUNT(*) FROM client_verification_documents 
      WHERE client_id = u.id AND upload_status = 'success'
    )
    ELSE 0
  END as total_documents_uploaded,
  CASE 
    WHEN u.role = 'lady' THEN 4
    WHEN u.role = 'club' THEN 3  
    WHEN u.role = 'client' THEN 2
    ELSE 0
  END as required_documents,
  -- Calculate priority score
  CASE 
    WHEN u.verification_submitted_at IS NULL THEN 0
    ELSE GREATEST(0, 100 - EXTRACT(HOURS FROM (NOW() - u.verification_submitted_at)))
  END as priority_score,
  -- Calculate completion percentage
  CASE 
    WHEN u.role = 'lady' THEN ROUND(
      (SELECT COUNT(*) FROM lady_verification_documents 
       WHERE lady_id = u.id AND upload_status = 'success') * 100.0 / 4
    )
    WHEN u.role = 'club' THEN ROUND(
      (SELECT COUNT(*) FROM club_verification_documents 
       WHERE club_id = u.id AND upload_status = 'success') * 100.0 / 3
    )
    WHEN u.role = 'client' THEN ROUND(
      (SELECT COUNT(*) FROM client_verification_documents 
       WHERE client_id = u.id AND upload_status = 'success') * 100.0 / 2
    )
    ELSE 0
  END as completion_percentage
FROM users u
WHERE u.role IN ('lady', 'club', 'client') 
  AND (u.is_verified = false OR u.verification_status != 'verified')
ORDER BY u.verification_submitted_at ASC NULLS LAST; 