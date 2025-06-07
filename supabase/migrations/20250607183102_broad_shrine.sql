/*
  # HydroSnap Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `full_name` (text)
      - `daily_goal` (integer, default 2500ml)
      - `activity_level` (text, default 'lightly_active')
      - `climate` (text, default 'mild')
      - `primary_goal` (text, default 'general_wellness')
      - `reminder_frequency` (integer, default 90 minutes)
      - `preferred_units` (text, default 'metric')
      - `timezone` (text)
      - `onboarding_completed` (boolean, default false)
      - `premium_subscription` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `water_intake_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `amount_ml` (integer)
      - `logged_at` (timestamp)
      - `date` (date, for daily aggregation)
      - `source` (text, e.g., 'manual', 'quick_action', 'reminder')

    - `mood_energy_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `mood_level` (integer, 1-5 scale)
      - `energy_level` (integer, 1-5 scale)
      - `logged_at` (timestamp)
      - `date` (date)
      - `notes` (text, optional)

    - `daily_summaries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `date` (date)
      - `total_water_ml` (integer, default 0)
      - `goal_achieved` (boolean, default false)
      - `avg_mood` (decimal)
      - `avg_energy` (decimal)
      - `intake_count` (integer, default 0)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `reminders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `title` (text)
      - `message` (text)
      - `scheduled_for` (timestamp)
      - `sent` (boolean, default false)
      - `type` (text, e.g., 'hydration', 'mood_check')
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for reading/writing user-specific records

  3. Indexes
    - Add indexes for frequently queried columns (user_id, date, logged_at)
    - Add composite indexes for common query patterns
*/

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  daily_goal integer DEFAULT 2500,
  activity_level text DEFAULT 'lightly_active' CHECK (activity_level IN ('sedentary', 'lightly_active', 'very_active', 'athlete')),
  climate text DEFAULT 'mild' CHECK (climate IN ('cold', 'mild', 'hot', 'very_hot')),
  primary_goal text DEFAULT 'general_wellness' CHECK (primary_goal IN ('boost_energy', 'improve_skin', 'increase_focus', 'general_wellness')),
  reminder_frequency integer DEFAULT 90, -- minutes
  preferred_units text DEFAULT 'metric' CHECK (preferred_units IN ('metric', 'imperial')),
  timezone text DEFAULT 'UTC',
  onboarding_completed boolean DEFAULT false,
  premium_subscription boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create water intake logs table
CREATE TABLE IF NOT EXISTS water_intake_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount_ml integer NOT NULL CHECK (amount_ml > 0),
  logged_at timestamptz DEFAULT now(),
  date date DEFAULT CURRENT_DATE,
  source text DEFAULT 'manual' CHECK (source IN ('manual', 'quick_action', 'reminder', 'custom'))
);

-- Create mood and energy logs table
CREATE TABLE IF NOT EXISTS mood_energy_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  mood_level integer CHECK (mood_level >= 1 AND mood_level <= 5),
  energy_level integer CHECK (energy_level >= 1 AND energy_level <= 5),
  logged_at timestamptz DEFAULT now(),
  date date DEFAULT CURRENT_DATE,
  notes text
);

-- Create daily summaries table
CREATE TABLE IF NOT EXISTS daily_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  total_water_ml integer DEFAULT 0,
  goal_achieved boolean DEFAULT false,
  avg_mood decimal(3,2),
  avg_energy decimal(3,2),
  intake_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text,
  scheduled_for timestamptz NOT NULL,
  sent boolean DEFAULT false,
  type text DEFAULT 'hydration' CHECK (type IN ('hydration', 'mood_check', 'goal_reminder')),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_intake_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_energy_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create policies for water_intake_logs
CREATE POLICY "Users can read own water intake logs"
  ON water_intake_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own water intake logs"
  ON water_intake_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own water intake logs"
  ON water_intake_logs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own water intake logs"
  ON water_intake_logs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for mood_energy_logs
CREATE POLICY "Users can read own mood energy logs"
  ON mood_energy_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mood energy logs"
  ON mood_energy_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mood energy logs"
  ON mood_energy_logs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own mood energy logs"
  ON mood_energy_logs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for daily_summaries
CREATE POLICY "Users can read own daily summaries"
  ON daily_summaries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily summaries"
  ON daily_summaries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily summaries"
  ON daily_summaries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for reminders
CREATE POLICY "Users can read own reminders"
  ON reminders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminders"
  ON reminders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders"
  ON reminders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders"
  ON reminders
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_water_intake_logs_user_date ON water_intake_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_water_intake_logs_logged_at ON water_intake_logs(logged_at);
CREATE INDEX IF NOT EXISTS idx_mood_energy_logs_user_date ON mood_energy_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_summaries_user_date ON daily_summaries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_reminders_user_scheduled ON reminders(user_id, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_reminders_sent ON reminders(sent, scheduled_for);

-- Create function to automatically update daily summaries
CREATE OR REPLACE FUNCTION update_daily_summary()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update daily summary when water intake is logged
  INSERT INTO daily_summaries (user_id, date, total_water_ml, intake_count, goal_achieved, updated_at)
  VALUES (
    NEW.user_id,
    NEW.date,
    NEW.amount_ml,
    1,
    false,
    now()
  )
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    total_water_ml = daily_summaries.total_water_ml + NEW.amount_ml,
    intake_count = daily_summaries.intake_count + 1,
    goal_achieved = (daily_summaries.total_water_ml + NEW.amount_ml) >= (
      SELECT daily_goal FROM profiles WHERE id = NEW.user_id
    ),
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic daily summary updates
CREATE TRIGGER trigger_update_daily_summary
  AFTER INSERT ON water_intake_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_summary();

-- Create function to update mood/energy averages in daily summaries
CREATE OR REPLACE FUNCTION update_mood_energy_summary()
RETURNS TRIGGER AS $$
BEGIN
  -- Update daily summary with mood and energy averages
  INSERT INTO daily_summaries (user_id, date, avg_mood, avg_energy, updated_at)
  VALUES (
    NEW.user_id,
    NEW.date,
    NEW.mood_level,
    NEW.energy_level,
    now()
  )
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    avg_mood = (
      SELECT AVG(mood_level)::decimal(3,2)
      FROM mood_energy_logs
      WHERE user_id = NEW.user_id AND date = NEW.date AND mood_level IS NOT NULL
    ),
    avg_energy = (
      SELECT AVG(energy_level)::decimal(3,2)
      FROM mood_energy_logs
      WHERE user_id = NEW.user_id AND date = NEW.date AND energy_level IS NOT NULL
    ),
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for mood/energy summary updates
CREATE TRIGGER trigger_update_mood_energy_summary
  AFTER INSERT OR UPDATE ON mood_energy_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_mood_energy_summary();

-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, created_at)
  VALUES (NEW.id, NEW.email, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic profile creation
CREATE TRIGGER trigger_handle_new_user
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();