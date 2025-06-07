/*
  # Create drinks log table for Smart Drink Entry

  1. New Tables
    - `drinks_log`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `name` (text, drink name)
      - `volume_ml` (integer, volume in milliliters)
      - `hydration_score` (numeric, 0-1 scale for hydration effectiveness)
      - `caffeine_mg` (integer, optional caffeine content)
      - `drink_type` (text, category of drink)
      - `logged_at` (timestamp)
      - `date` (date, for daily aggregation)
      - `source` (text, manual/ai/quick_action)

  2. Security
    - Enable RLS on `drinks_log` table
    - Add policies for authenticated users to manage their own drink logs

  3. Indexes
    - Add indexes for user_id + date queries
    - Add index for logged_at for chronological queries

  4. Triggers
    - Update daily summaries when drinks are logged
*/

-- Create drinks_log table
CREATE TABLE IF NOT EXISTS drinks_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  volume_ml integer NOT NULL CHECK (volume_ml > 0),
  hydration_score numeric(3,2) DEFAULT 1.0 CHECK (hydration_score >= 0 AND hydration_score <= 1),
  caffeine_mg integer DEFAULT 0 CHECK (caffeine_mg >= 0),
  drink_type text DEFAULT 'water' CHECK (drink_type IN ('water', 'tea', 'coffee', 'juice', 'soda', 'sports_drink', 'alcohol', 'other')),
  logged_at timestamptz DEFAULT now(),
  date date DEFAULT CURRENT_DATE,
  source text DEFAULT 'manual' CHECK (source IN ('manual', 'ai', 'quick_action'))
);

-- Enable RLS
ALTER TABLE drinks_log ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert own drink logs"
  ON drinks_log
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own drink logs"
  ON drinks_log
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own drink logs"
  ON drinks_log
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own drink logs"
  ON drinks_log
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_drinks_log_user_date ON drinks_log(user_id, date);
CREATE INDEX IF NOT EXISTS idx_drinks_log_logged_at ON drinks_log(logged_at);
CREATE INDEX IF NOT EXISTS idx_drinks_log_user_logged_at ON drinks_log(user_id, logged_at);

-- Create function to update daily summaries when drinks are logged
CREATE OR REPLACE FUNCTION update_daily_summary_with_drinks()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert daily summary
  INSERT INTO daily_summaries (user_id, date, total_water_ml, intake_count)
  VALUES (
    NEW.user_id,
    NEW.date,
    (NEW.volume_ml * NEW.hydration_score)::integer,
    1
  )
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    total_water_ml = daily_summaries.total_water_ml + (NEW.volume_ml * NEW.hydration_score)::integer,
    intake_count = daily_summaries.intake_count + 1,
    goal_achieved = (daily_summaries.total_water_ml + (NEW.volume_ml * NEW.hydration_score)::integer) >= (
      SELECT daily_goal FROM profiles WHERE id = NEW.user_id
    ),
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for drinks log
CREATE TRIGGER trigger_update_daily_summary_drinks
  AFTER INSERT ON drinks_log
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_summary_with_drinks();