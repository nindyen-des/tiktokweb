import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface AccessKey {
  id: string;
  key: string;
  duration_type: '1day' | '2day' | '3day' | 'lifetime';
  expires_at: string | null;
  created_at: string;
  is_active: boolean;
  used_count: number;
}

export interface BoostSession {
  id: string;
  access_key_id: string;
  tiktok_url: string;
  total_views: number;
  total_likes: number;
  success_count: number;
  failed_count: number;
  started_at: string;
  last_update: string;
  is_active: boolean;
}
