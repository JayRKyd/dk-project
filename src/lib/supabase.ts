import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

/**
 * Creates a Supabase client configured for browser usage
 * with proper auth settings for handling redirects and session management
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
});

// Set up auth state change listener
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session ? 'User session available' : 'No user session');
});

/**
 * Gets the base URL for the current environment
 * Useful for generating redirect URLs for auth flows
 */
export const getBaseUrl = () => {
  return window.location.origin;
};

/**
 * Generates a full redirect URL for auth operations
 * @param path - The path to redirect to after auth (e.g., '/reset-password')
 * @returns A properly formatted URL for Supabase auth redirects
 */
export const getRedirectUrl = (path: string) => {
  const baseUrl = getBaseUrl();
  return `${baseUrl}${path}`;
};

/**
 * Helper function to extract auth parameters from URL
 * Used for handling auth redirects like password reset
 */
export const getAuthParamsFromUrl = () => {
  // Check query parameters first
  const searchParams = new URLSearchParams(window.location.search);
  
  // Handle new code-based flow (newer Supabase versions)
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  
  // Handle legacy hash-based flow
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const email = searchParams.get('email');
  
  // Also check URL hash for legacy tokens
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const hashTokenHash = hashParams.get('token_hash');
  const hashType = hashParams.get('type');
  const hashEmail = hashParams.get('email');
  
  return {
    // New code-based flow
    code,
    error,
    errorDescription,
    // Legacy hash-based flow
    tokenHash: tokenHash || hashTokenHash,
    type: type || hashType,
    email: email || hashEmail,
    // Determine if we have valid auth params
    hasAuthParams: !!(code || (tokenHash || hashTokenHash) && (type || hashType))
  };
};