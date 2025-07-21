-- Gift Replies System Migration
-- Adds gift_replies table for lady-client gift interactions

-- Create gift_replies table
CREATE TABLE gift_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_id uuid REFERENCES gifts(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES users(id) ON DELETE SET NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE gift_replies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for gift_replies
CREATE POLICY "Users can view gift replies for gifts they sent or received"
  ON gift_replies FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gifts g
      WHERE g.id = gift_replies.gift_id
      AND (g.sender_id = auth.uid() OR g.recipient_id = auth.uid())
    )
  );

CREATE POLICY "Users can create replies to gifts they received"
  ON gift_replies FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gifts g
      WHERE g.id = gift_replies.gift_id
      AND g.recipient_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own gift replies"
  ON gift_replies FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can delete their own gift replies"
  ON gift_replies FOR DELETE
  TO authenticated
  USING (sender_id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_gift_replies_gift_id ON gift_replies(gift_id);
CREATE INDEX idx_gift_replies_sender_id ON gift_replies(sender_id);
CREATE INDEX idx_gift_replies_created_at ON gift_replies(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_gift_replies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_gift_replies_updated_at
  BEFORE UPDATE ON gift_replies
  FOR EACH ROW
  EXECUTE FUNCTION update_gift_replies_updated_at(); 