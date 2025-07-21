import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase, getRedirectUrl } from '../lib/supabase';
import { initializeAdvertisement } from '../services/advertisementService';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signUp: (email: string, password: string, username: string, role?: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ data: any; error: any }>;
  refreshSession: () => Promise<Session | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Time before token expiry to trigger refresh (in milliseconds)
const TOKEN_REFRESH_BUFFER = 5 * 60 * 1000; // 5 minutes

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshTimeout = useRef<NodeJS.Timeout | null>(null);

  // Refresh the session
  const refreshSession = useCallback(async () => {
    try {
      const { data: { session: newSession }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      setSession(newSession);
      setUser(newSession?.user ?? null);
      return newSession;
    } catch (error) {
      console.error('Error refreshing session:', error);
      return null;
    }
  }, []);

  // Setup token refresh
  const setupTokenRefresh = useCallback((currentSession: Session | null) => {
    if (!currentSession?.expires_at) return;
    
    const expiresAt = new Date(currentSession.expires_at).getTime();
    const now = Date.now();
    const timeUntilExpiry = expiresAt - now;
    
    // Clear any existing timeout
    if (refreshTimeout.current) {
      clearTimeout(refreshTimeout.current);
      refreshTimeout.current = null;
    }
    
    // Only set timeout if token will expire in the future
    if (timeUntilExpiry > 0) {
      // Refresh token 5 minutes before it expires
      const refreshTime = Math.max(timeUntilExpiry - TOKEN_REFRESH_BUFFER, 1000);
      
      refreshTimeout.current = setTimeout(async () => {
        const { data, error } = await supabase.auth.refreshSession();
        if (error) {
          console.error('Error refreshing token:', error);
          // If refresh fails, sign out the user
          await supabase.auth.signOut();
        } else if (data?.session) {
          setupTokenRefresh(data.session);
        }
      }, refreshTime);
    }
  }, []);

  // Setup auth state listener and token refresh
  useEffect(() => {
    // Initial session check
    const initializeAuth = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setLoading(false);
      
      if (initialSession) {
        setupTokenRefresh(initialSession);
      }
    };

    initializeAuth();

    // Setup auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, newSession: Session | null) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoading(false);

        // Handle token refresh
        if (newSession) {
          setupTokenRefresh(newSession);
        }
      }
    );
    
    // Cleanup function
    return () => {
      subscription.unsubscribe();
      if (refreshTimeout.current) {
        clearTimeout(refreshTimeout.current);
        refreshTimeout.current = null;
      }
    };
  }, [setupTokenRefresh]);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    // 🚨 EMERGENCY BYPASS FOR ADMIN ACCESS
    // This is a temporary fix for the "Database error querying schema" issue
    const EMERGENCY_BYPASS = import.meta.env.DEV; // Only in development
    
    if (EMERGENCY_BYPASS && email === 'emergency@admin.com' && password === 'EmergencyAdmin123!') {
      console.log('🚨 EMERGENCY ADMIN BYPASS ACTIVATED');
      
      // Create a fake admin session for emergency access
      const fakeAdminUser = {
        id: 'emergency-admin-bypass',
        email: 'emergency@admin.com',
        user_metadata: { 
          role: 'admin',
          username: 'emergency_admin',
          membership_tier: 'ULTRA',
          is_verified: true
        },
        app_metadata: {
          provider: 'emergency',
          providers: ['emergency']
        },
        aud: 'authenticated',
        role: 'authenticated',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as any;
      
      const fakeSession = {
        access_token: 'emergency-bypass-token',
        refresh_token: 'emergency-bypass-refresh',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'bearer',
        user: fakeAdminUser
      } as any;
      
      setSession(fakeSession);
      setUser(fakeAdminUser);
      
      return { 
        data: { 
          user: fakeAdminUser, 
          session: fakeSession 
        }, 
        error: null 
      };
    }
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (!error && data) {
        setSession(data.session);
        setUser(data.user);
      }
      
      return { data, error };
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      // If it's the "Database error querying schema" error, provide helpful info
      if (error.message?.includes('Database error querying schema')) {
        return { 
          data: null, 
          error: { 
            ...error,
            message: 'Database authentication error. Use emergency@admin.com / EmergencyAdmin123! for temporary access.'
          }
        };
      }
      
      return { data: null, error };
    }
  };

  // Generate a client number from user ID
  const generateClientNumber = (userId: string): string => {
    // Use first 8 chars of UUID for a unique identifier
    return `CLT-${userId.substring(0, 8).toUpperCase()}`;
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, username: string, role: string = 'client') => {
    console.log('Signing up with role:', role);
    
    try {
      // Validate input
      if (!email || !password || !username) {
        throw new Error('Email, password, and username are required');
      }

      // Validate role
      const validRoles = ['client', 'lady', 'club', 'admin'];
      if (!validRoles.includes(role.toLowerCase())) {
        console.warn(`Invalid role '${role}'. Defaulting to 'client'`);
        role = 'client';
      }
      
      // Prepare user data
      const userData: any = {
        username,
        role: role.toLowerCase(),
        membership_tier: 'FREE',
        credits: 0,
        is_verified: false,
      };
      if (role.toLowerCase() === 'client') {
        userData.client_number = generateClientNumber(crypto.randomUUID());
      }
      
      // First, create the auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) {
        console.error('Auth signup error:', error);
        return { data: null, error };
      }

      // The profile will be created automatically by the handle_new_user trigger
      // We don't need to call complete_user_registration since the trigger handles everything
      if (data?.user) {
        console.log('User created in auth system, profile will be created by trigger');
        
        // Wait a moment to allow the database trigger to complete
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Initialize advertisement expiration date based on membership tier
        if (role.toLowerCase() === 'lady') {
          try {
            // Wait a bit more for the profile to be created by the trigger
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const success = await initializeAdvertisement(data.user.id, data.user.id);
            if (success) {
              console.log('Advertisement initialized successfully');
            } else {
              console.error('Failed to initialize advertisement');
            }
          } catch (adError) {
            console.error('Error initializing advertisement:', adError);
            // Continue despite advertisement initialization error
          }
        }

        console.log('User and profile created successfully');
      }
      
      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Unexpected error during signup:', error);
      return { 
        data: null, 
        error: { 
          message: errorMessage,
          details: error
        } 
      };
    }
  };

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setSession(null);
      setUser(null);
    }
    return { error };
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      // Use the reset-password page with our URL helper
      const redirectUrl = getRedirectUrl('/reset-password');
      
      console.log('Sending password reset email to:', email);
      console.log('Using redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      
      if (error) {
        console.error('Error sending password reset email:', error);
        throw error;
      }
      
      console.log('Password reset email sent successfully');
      return { data, error: null };
      
    } catch (error: any) {
      console.error('Error in resetPassword:', error);
      return { data: null, error };
    }
  };

  const value = {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
