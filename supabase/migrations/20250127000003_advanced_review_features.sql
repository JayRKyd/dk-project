-- Advanced Review Features Migration
-- Adds like/dislike, editing, and moderation capabilities to reviews

-- Add new columns to reviews table
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_edited boolean DEFAULT false;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS edited_at timestamptz;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS edit_history jsonb DEFAULT '[]';
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS moderation_status text DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'flagged'));
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS moderation_notes text;

-- Create review_interactions table for likes/dislikes
CREATE TABLE IF NOT EXISTS review_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid REFERENCES reviews(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  interaction_type text NOT NULL CHECK (interaction_type IN ('like', 'dislike')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(review_id, user_id, interaction_type)
);

-- Create review_edit_history table for tracking changes
CREATE TABLE IF NOT EXISTS review_edit_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid REFERENCES reviews(id) ON DELETE CASCADE,
  edited_by uuid REFERENCES users(id) ON DELETE SET NULL,
  old_content jsonb NOT NULL, -- Store old review data
  new_content jsonb NOT NULL, -- Store new review data
  edit_reason text,
  created_at timestamptz DEFAULT now()
);

-- Create review_moderation_log table
CREATE TABLE IF NOT EXISTS review_moderation_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid REFERENCES reviews(id) ON DELETE CASCADE,
  moderator_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL CHECK (action IN ('approve', 'reject', 'flag', 'edit')),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE review_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_edit_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_moderation_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for review_interactions
CREATE POLICY "Users can view interactions on approved reviews"
  ON review_interactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM reviews r
      WHERE r.id = review_interactions.review_id
      AND r.moderation_status = 'approved'
    )
  );

CREATE POLICY "Users can interact with approved reviews"
  ON review_interactions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM reviews r
      WHERE r.id = review_interactions.review_id
      AND r.moderation_status = 'approved'
    )
    AND user_id = auth.uid()
  );

CREATE POLICY "Users can update their own interactions"
  ON review_interactions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own interactions"
  ON review_interactions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for review_edit_history
CREATE POLICY "Users can view edit history for their own reviews"
  ON review_edit_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM reviews r
      WHERE r.id = review_edit_history.review_id
      AND r.author_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all edit history"
  ON review_edit_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'admin'
    )
  );

CREATE POLICY "Users can create edit history for their own reviews"
  ON review_edit_history FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM reviews r
      WHERE r.id = review_edit_history.review_id
      AND r.author_id = auth.uid()
    )
    AND edited_by = auth.uid()
  );

-- RLS Policies for review_moderation_log
CREATE POLICY "Admins can view moderation log"
  ON review_moderation_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'admin'
    )
  );

CREATE POLICY "Admins can create moderation log entries"
  ON review_moderation_log FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'admin'
    )
    AND moderator_id = auth.uid()
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_review_interactions_review_id ON review_interactions(review_id);
CREATE INDEX IF NOT EXISTS idx_review_interactions_user_id ON review_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_review_interactions_type ON review_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_review_edit_history_review_id ON review_edit_history(review_id);
CREATE INDEX IF NOT EXISTS idx_review_moderation_log_review_id ON review_moderation_log(review_id);
CREATE INDEX IF NOT EXISTS idx_reviews_moderation_status ON reviews(moderation_status);
CREATE INDEX IF NOT EXISTS idx_reviews_is_edited ON reviews(is_edited);

-- Create function to update review like/dislike counts
CREATE OR REPLACE FUNCTION update_review_interaction_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.interaction_type = 'like' THEN
      UPDATE reviews 
      SET likes = likes + 1 
      WHERE id = NEW.review_id;
    ELSIF NEW.interaction_type = 'dislike' THEN
      UPDATE reviews 
      SET dislikes = dislikes + 1 
      WHERE id = NEW.review_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.interaction_type = 'like' THEN
      UPDATE reviews 
      SET likes = likes - 1 
      WHERE id = OLD.review_id;
    ELSIF OLD.interaction_type = 'dislike' THEN
      UPDATE reviews 
      SET dislikes = dislikes - 1 
      WHERE id = OLD.review_id;
    END IF;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle changing from like to dislike or vice versa
    IF OLD.interaction_type = 'like' AND NEW.interaction_type = 'dislike' THEN
      UPDATE reviews 
      SET likes = likes - 1, dislikes = dislikes + 1 
      WHERE id = NEW.review_id;
    ELSIF OLD.interaction_type = 'dislike' AND NEW.interaction_type = 'like' THEN
      UPDATE reviews 
      SET likes = likes + 1, dislikes = dislikes - 1 
      WHERE id = NEW.review_id;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update interaction counts
CREATE TRIGGER update_review_interaction_counts
  AFTER INSERT OR UPDATE OR DELETE ON review_interactions
  FOR EACH ROW
  EXECUTE FUNCTION update_review_interaction_counts();

-- Create function to log review edits
CREATE OR REPLACE FUNCTION log_review_edit()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.content != NEW.content OR OLD.rating != NEW.rating OR OLD.positives != NEW.positives OR OLD.negatives != NEW.negatives THEN
    -- Insert edit history
    INSERT INTO review_edit_history (
      review_id,
      edited_by,
      old_content,
      new_content,
      edit_reason
    ) VALUES (
      NEW.id,
      NEW.author_id,
      jsonb_build_object(
        'content', OLD.content,
        'rating', OLD.rating,
        'positives', OLD.positives,
        'negatives', OLD.negatives
      ),
      jsonb_build_object(
        'content', NEW.content,
        'rating', NEW.rating,
        'positives', NEW.positives,
        'negatives', NEW.negatives
      ),
      'User edit'
    );
    
    -- Update review edit flags
    NEW.is_edited = true;
    NEW.edited_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically log review edits
CREATE TRIGGER log_review_edit
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION log_review_edit();

-- Create function to check if user can edit review
CREATE OR REPLACE FUNCTION can_edit_review(review_id uuid, user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM reviews r
    WHERE r.id = review_id
    AND r.author_id = user_id
    AND r.moderation_status = 'approved'
    AND r.created_at > now() - interval '24 hours'
  );
END;
$$ LANGUAGE plpgsql; 