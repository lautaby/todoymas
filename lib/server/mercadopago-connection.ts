import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function getServiceSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
}

export async function requireAdmin(request?: Request) {
  const cookieStore = cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) { return cookieStore.get(name)?.value; },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') throw new Error('Forbidden');
  return user;
}

export async function getValidMercadoPagoAccessToken() {
  const supabase = await getServiceSupabase();
  const { data, error } = await supabase
    .from('mercadopago_connection')
    .select('*')
    .single();

  if (error || !data) return null;
  return data.access_token;
}

export async function getMercadoPagoConnectionStatus() {
  const token = await getValidMercadoPagoAccessToken();
  return { connected: !!token };
}

export async function saveMercadoPagoTokens(tokens: any) {
  const supabase = await getServiceSupabase();
  const { error } = await supabase
    .from('mercadopago_connection')
    .upsert({
      id: 'default',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      updated_at: new Date().toISOString()
    });
  if (error) throw error;
}

export async function disconnectMercadoPago() {
  const supabase = await getServiceSupabase();
  const { error } = await supabase
    .from('mercadopago_connection')
    .delete()
    .eq('id', 'default');
  if (error) throw error;
}

export async function createPendingOauthState() {
  const state = crypto.randomUUID();
  const supabase = await getServiceSupabase();
  await supabase.from('oauth_states').insert({ state, created_at: new Date().toISOString() });
  return state;
}

export async function consumePendingOauthState(state: string) {
  const supabase = await getServiceSupabase();
  const { data } = await supabase.from('oauth_states').delete().eq('state', state).select();
  return !!data?.length;
}
