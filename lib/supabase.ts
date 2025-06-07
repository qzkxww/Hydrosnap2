import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database
export interface DrinkLog {
  id: string;
  user_id: string;
  name: string;
  volume_ml: number;
  hydration_score: number;
  caffeine_mg: number;
  drink_type: string;
  logged_at: string;
  date: string;
  source: string;
}

export interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  daily_goal: number;
  activity_level: string;
  climate: string;
  primary_goal: string;
  reminder_frequency: number;
  preferred_units: string;
  timezone: string;
  onboarding_completed: boolean;
  premium_subscription: boolean;
  created_at: string;
  updated_at: string;
}

// Database functions
export const saveDrinkLog = async (drinkData: {
  name: string;
  volume_ml: number;
  hydration_score: number;
  caffeine_mg?: number;
  drink_type?: string;
  source?: string;
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('drinks_log')
    .insert([
      {
        user_id: user.id,
        name: drinkData.name,
        volume_ml: drinkData.volume_ml,
        hydration_score: drinkData.hydration_score,
        caffeine_mg: drinkData.caffeine_mg || 0,
        drink_type: drinkData.drink_type || 'other',
        source: drinkData.source || 'manual',
      }
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const getDrinkLogs = async (date?: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  let query = supabase
    .from('drinks_log')
    .select('*')
    .eq('user_id', user.id)
    .order('logged_at', { ascending: false });

  if (date) {
    query = query.eq('date', date);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data;
};

export const getTodaysDrinkLogs = async () => {
  const today = new Date().toISOString().split('T')[0];
  return getDrinkLogs(today);
};