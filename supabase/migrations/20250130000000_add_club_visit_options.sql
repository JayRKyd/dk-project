-- Add visit options to clubs table
ALTER TABLE clubs
ADD COLUMN IF NOT EXISTS club_visit_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS escort_visit_enabled BOOLEAN DEFAULT false;

-- Add comments for clarity
COMMENT ON COLUMN clubs.club_visit_enabled IS 'Whether the club offers in-club visits';
COMMENT ON COLUMN clubs.escort_visit_enabled IS 'Whether the club offers escort/outcall services';