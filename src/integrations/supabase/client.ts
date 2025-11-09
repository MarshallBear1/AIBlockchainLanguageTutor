import { createClient } from '@supabase/supabase-js';

// To enable authentication, you need to:
// 1. Enable Lovable Cloud in the Cloud tab, OR
// 2. Add your own Supabase project URL and anon key as secrets:
//    - SUPABASE_URL
//    - SUPABASE_ANON_KEY

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Authentication features will not work.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
