import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Credential = {
  id: string;
  user_id: string;
  title: string;
  type: 'api_key' | 'password' | 'note';
  username?: string;
  value: string;
  url?: string;
  description?: string;
  created_at: string;
  updated_at: string;
};
