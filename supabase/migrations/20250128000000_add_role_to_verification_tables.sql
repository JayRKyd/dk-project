-- Add role column to verification document tables
-- Created: January 28, 2025
-- Purpose: Add role column to lady_verification_documents, club_verification_documents, and client_verification_documents tables

-- Add role column to lady_verification_documents
ALTER TABLE lady_verification_documents 
ADD COLUMN role TEXT DEFAULT 'lady' CHECK (role IN ('lady', 'club', 'client'));

-- Add role column to club_verification_documents (if it exists)
ALTER TABLE club_verification_documents 
ADD COLUMN role TEXT DEFAULT 'club' CHECK (role IN ('lady', 'club', 'client'));

-- Add role column to client_verification_documents (if it exists)
ALTER TABLE client_verification_documents 
ADD COLUMN role TEXT DEFAULT 'client' CHECK (role IN ('lady', 'club', 'client'));

-- Update existing records to set the correct role
UPDATE lady_verification_documents SET role = 'lady' WHERE role IS NULL;
UPDATE club_verification_documents SET role = 'club' WHERE role IS NULL;
UPDATE client_verification_documents SET role = 'client' WHERE role IS NULL;

-- Make the role column NOT NULL after setting defaults
ALTER TABLE lady_verification_documents ALTER COLUMN role SET NOT NULL;
ALTER TABLE club_verification_documents ALTER COLUMN role SET NOT NULL;
ALTER TABLE client_verification_documents ALTER COLUMN role SET NOT NULL; 