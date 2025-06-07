import { supabase } from './supabase';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

// Configure WebBrowser for auth session
WebBrowser.maybeCompleteAuthSession();

// Create auth request configuration
const createAuthRequest = () => {
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'hydrosnap',
    path: 'auth/callback',
  });

  return {
    redirectUri,
    scopes: ['openid', 'profile', 'email'],
    additionalParameters: {},
    responseType: AuthSession.ResponseType.Code,
    extraParams: {
      access_type: 'offline',
    },
  };
};

export const signInWithGoogle = async () => {
  try {
    const { redirectUri } = createAuthRequest();
    
    // For web platform, use Supabase's built-in OAuth
    if (Platform.OS === 'web') {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) throw error;
      return { data, error: null };
    }

    // For mobile platforms, use expo-auth-session
    const authUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUri)}`;
    
    const result = await AuthSession.startAsync({
      authUrl,
      returnUrl: redirectUri,
    });

    if (result.type === 'success') {
      const { url } = result;
      const urlParams = new URLSearchParams(url.split('#')[1] || url.split('?')[1]);
      const accessToken = urlParams.get('access_token');
      const refreshToken = urlParams.get('refresh_token');

      if (accessToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        });

        if (error) throw error;
        return { data, error: null };
      }
    }

    return { data: null, error: new Error('Authentication cancelled') };
  } catch (error) {
    console.error('Google sign-in error:', error);
    return { data: null, error };
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Email sign-in error:', error);
    return { data: null, error };
  }
};

export const signUpWithEmail = async (email: string, password: string, fullName?: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Email sign-up error:', error);
    return { data: null, error };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Sign-out error:', error);
    return { error };
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return { user, error: null };
  } catch (error) {
    console.error('Get user error:', error);
    return { user: null, error };
  }
};

export const resetPassword = async (email: string) => {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: Platform.OS === 'web' 
        ? `${window.location.origin}/auth/reset-password`
        : 'hydrosnap://auth/reset-password',
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Password reset error:', error);
    return { data: null, error };
  }
};