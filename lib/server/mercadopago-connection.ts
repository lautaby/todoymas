import { createClient } from '@supabase/supabase-js';

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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  // El front-end (admin/pagos) manda el access_token de la sesión de
  // Supabase en el header Authorization: "Bearer <token>". El cliente de
  // supabase-js guarda la sesión en localStorage, no en cookies, así que
  // acá hay que leer el header — nunca va a haber una cookie seteada.
  const authHeader = request?.headers.get('authorization') ?? request?.headers.get('Authorization');
  const token = authHeader?.replace(/^Bearer\s+/i, '').trim();

  if (!token) throw new Error('Unauthorized');

  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) throw new Error('Unauthorized');

  const adminClient = await getServiceSupabase();
  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) throw new Error(`Profile lookup failed: ${profileError.message}`);
  if (!profile) throw new Error(`Forbidden: no profile row for user ${user.id}`);
  if (profile.role !== 'admin') throw new Error(`Forbidden: role is "${profile.role}"`);
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
  const supabase = await getServiceSupabase();
  const { data, error } = await supabase
    .from('mercadopago_connection')
    .select('access_token, mp_user_id')
    .single();

  if (error || !data?.access_token) return { connected: false, mpUserId: null };
  return { connected: true, mpUserId: data.mp_user_id ?? null };
}

export async function saveMercadoPagoTokens(tokens: any) {
  const supabase = await getServiceSupabase();
  // id es boolean (tabla singleton, CHECK id = true) — NO un string 'default'.
  // Los nombres de columna tienen que matchear la migración: token_expires_at,
  // no expires_at.
  const { error } = await supabase
    .from('mercadopago_connection')
    .upsert({
      id: true,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      public_key: tokens.public_key ?? null,
      mp_user_id: tokens.user_id ? String(tokens.user_id) : null,
      token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      connected_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  if (error) throw error;
}

export async function disconnectMercadoPago() {
  const supabase = await getServiceSupabase();
  const { error } = await supabase
    .from('mercadopago_connection')
    .delete()
    .eq('id', true);
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
