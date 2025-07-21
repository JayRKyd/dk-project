/*
  # Add Review Interactions Table for Experienced Community

  1. New Table
    - `review_interactions`
      - `id` (uuid, primary key)
      - `review_id` (uuid, references reviews)
      - `user_id` (uuid, references users)
      - `interaction_type` (text, 'like' or 'dislike')
      - `created_at` (timestamp)
      - Unique constraint on (review_id, user_id)

  2. Security
    - Enable RLS on table
    - Add policy for experienced clients only (must have booked that lady)
*/

-- Create review_interactions table
CREATE TABLE review_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid REFERENCES reviews(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  interaction_type text NOT NULL CHECK (interaction_type IN ('like', 'dislike')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(review_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE review_interactions ENABLE ROW LEVEL SECURITY;

-- Create policy for experienced clients only
CREATE POLICY "Experienced clients can manage review interactions"
  ON review_interactions
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM bookings b
      JOIN reviews r ON r.id = review_interactions.review_id
      WHERE b.client_id = auth.uid()
      AND b.profile_id = r.profile_id
      AND b.status = 'completed'
    )
  );

-- Create index for performance
CREATE INDEX idx_review_interactions_review_id ON review_interactions(review_id);
CREATE INDEX idx_review_interactions_user_id ON review_interactions(user_id);

-- Create function to update review interaction counts
CREATE OR REPLACE FUNCTION update_review_interaction_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update likes and dislikes count in reviews table
  UPDATE reviews
  SET 
    likes = (
      SELECT COUNT(*) 
      FROM review_interactions 
      WHERE review_id = COALESCE(NEW.review_id, OLD.review_id) 
      AND interaction_type = 'like'
    ),
    dislikes = (
      SELECT COUNT(*) 
      FROM review_interactions 
      WHERE review_id = COALESCE(NEW.review_id, OLD.review_id) 
      AND interaction_type = 'dislike'
    )
  WHERE id = COALESCE(NEW.review_id, OLD.review_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update counts
CREATE TRIGGER review_interaction_counts_trigger
  AFTER INSERT OR UPDATE OR DELETE ON review_interactions
  FOR EACH ROW
  EXECUTE FUNCTION update_review_interaction_counts(); 