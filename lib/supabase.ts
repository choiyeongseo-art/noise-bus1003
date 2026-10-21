import { createClient } from '@supabase/supabase-js';
// Publishable browser credentials only. RLS protects each player's save.
export const supabaseUrl = 'https://gqxgppgclnfjgvongecx.supabase.co';
export const supabaseKey = 'sb_publishable_ZEk6gNMptK2K1pmK6Rr4kw_sWeaTrVY';
export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl,supabaseKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}) : null;
