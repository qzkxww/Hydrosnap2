/*
  # Fix User Profile Creation

  1. Database Functions
    - Create or replace the handle_new_user function to properly create profiles
    - Ensure the function handles all required fields with proper defaults

  2. Triggers
    - Create trigger to automatically create profile when user signs up
    - Ensure trigger fires after user insertion in auth.users

  3. Security
    - Maintain existing RLS policies
    - Ensure proper permissions for profile creation
*/

-- Create or replace the function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    daily_goal,
    activity_level,
    climate,
    primary_goal,
    reminder_frequency,
    preferred_units,
    timezone,
    onboarding_completed,
    premium_subscription
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    2500,
    'lightly_active',
    'mild',
    'general_wellness',
    90,
    'metric',
    'UTC',
    false,
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Ensure the profiles table has proper constraints
DO $$
BEGIN
  -- Add foreign key constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_id_fkey' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles 
    ADD CONSTRAINT profiles_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;