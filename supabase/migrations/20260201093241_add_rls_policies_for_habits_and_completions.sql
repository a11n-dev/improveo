
-- Enable RLS on habits table
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

-- Habits policies: users can only access their own habits
CREATE POLICY "Users can view their own habits"
  ON habits FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own habits"
  ON habits FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own habits"
  ON habits FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own habits"
  ON habits FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Enable RLS on completions table
ALTER TABLE completions ENABLE ROW LEVEL SECURITY;

-- Completions policies: users can only access their own completions
CREATE POLICY "Users can view their own completions"
  ON completions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own completions"
  ON completions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own completions"
  ON completions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
;
