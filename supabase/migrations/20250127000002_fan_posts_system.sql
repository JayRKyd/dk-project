-- Fan Posts System Migration
-- Adds fan_posts and fan_post_media tables for content creation

-- Create fan_posts table
CREATE TABLE fan_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  theme text,
  is_premium boolean DEFAULT false,
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  status text DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create fan_post_media table for multiple images/videos
CREATE TABLE fan_post_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES fan_posts(id) ON DELETE CASCADE,
  media_type text NOT NULL CHECK (media_type IN ('image', 'video')),
  file_url text NOT NULL,
  file_name text,
  file_size integer,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create fan_post_likes table for tracking likes
CREATE TABLE fan_post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES fan_posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create fan_post_comments table
CREATE TABLE fan_post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES fan_posts(id) ON DELETE CASCADE,
  author_id uuid REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE fan_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_post_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_post_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for fan_posts
CREATE POLICY "Users can view published fan posts"
  ON fan_posts FOR SELECT
  TO authenticated
  USING (status = 'published');

CREATE POLICY "Users can create their own fan posts"
  ON fan_posts FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can update their own fan posts"
  ON fan_posts FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can delete their own fan posts"
  ON fan_posts FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- RLS Policies for fan_post_media
CREATE POLICY "Users can view media for published posts"
  ON fan_post_media FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM fan_posts p
      WHERE p.id = fan_post_media.post_id
      AND p.status = 'published'
    )
  );

CREATE POLICY "Users can create media for their own posts"
  ON fan_post_media FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM fan_posts p
      WHERE p.id = fan_post_media.post_id
      AND p.author_id = auth.uid()
    )
  );

CREATE POLICY "Users can update media for their own posts"
  ON fan_post_media FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM fan_posts p
      WHERE p.id = fan_post_media.post_id
      AND p.author_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete media for their own posts"
  ON fan_post_media FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM fan_posts p
      WHERE p.id = fan_post_media.post_id
      AND p.author_id = auth.uid()
    )
  );

-- RLS Policies for fan_post_likes
CREATE POLICY "Users can view likes for published posts"
  ON fan_post_likes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM fan_posts p
      WHERE p.id = fan_post_likes.post_id
      AND p.status = 'published'
    )
  );

CREATE POLICY "Users can like published posts"
  ON fan_post_likes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM fan_posts p
      WHERE p.id = fan_post_likes.post_id
      AND p.status = 'published'
    )
    AND user_id = auth.uid()
  );

CREATE POLICY "Users can unlike their own likes"
  ON fan_post_likes FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for fan_post_comments
CREATE POLICY "Users can view comments for published posts"
  ON fan_post_comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM fan_posts p
      WHERE p.id = fan_post_comments.post_id
      AND p.status = 'published'
    )
  );

CREATE POLICY "Users can comment on published posts"
  ON fan_post_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM fan_posts p
      WHERE p.id = fan_post_comments.post_id
      AND p.status = 'published'
    )
    AND author_id = auth.uid()
  );

CREATE POLICY "Users can update their own comments"
  ON fan_post_comments FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can delete their own comments"
  ON fan_post_comments FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_fan_posts_author_id ON fan_posts(author_id);
CREATE INDEX idx_fan_posts_status ON fan_posts(status);
CREATE INDEX idx_fan_posts_created_at ON fan_posts(created_at);
CREATE INDEX idx_fan_post_media_post_id ON fan_post_media(post_id);
CREATE INDEX idx_fan_post_likes_post_id ON fan_post_likes(post_id);
CREATE INDEX idx_fan_post_likes_user_id ON fan_post_likes(user_id);
CREATE INDEX idx_fan_post_comments_post_id ON fan_post_comments(post_id);
CREATE INDEX idx_fan_post_comments_author_id ON fan_post_comments(author_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_fan_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_fan_posts_updated_at
  BEFORE UPDATE ON fan_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_fan_posts_updated_at();

-- Create function to update comment updated_at
CREATE OR REPLACE FUNCTION update_fan_post_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update comment updated_at
CREATE TRIGGER update_fan_post_comments_updated_at
  BEFORE UPDATE ON fan_post_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_fan_post_comments_updated_at();

-- Create function to update like counts
CREATE OR REPLACE FUNCTION update_fan_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE fan_posts 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE fan_posts 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update like counts
CREATE TRIGGER update_fan_post_like_count
  AFTER INSERT OR DELETE ON fan_post_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_fan_post_like_count();

-- Create function to update comment counts
CREATE OR REPLACE FUNCTION update_fan_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE fan_posts 
    SET comments_count = comments_count + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE fan_posts 
    SET comments_count = comments_count - 1 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update comment counts
CREATE TRIGGER update_fan_post_comment_count
  AFTER INSERT OR DELETE ON fan_post_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_fan_post_comment_count(); 