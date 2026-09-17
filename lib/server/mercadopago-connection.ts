import { createClient } from '@supabase/supabase-js';

// Server-only helpers for the Mercado Pago OAuth connection. NEVER import
// this from a 'use client' component - it uses the Supabase service role
// key, which must stay off the browser bundle.

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase service role key not configured');
  }
  return createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
}

interface MpTokenResponse {
  access_token: string;
  refresh_token: string;
  public_key?: string;
  user_id?: number | string;
  expires_in: number; // seconds
}

// Saves the tokens Mercado Pago gives us after exchanging an OAuth code (or
// after a refresh), overwriting the single connection row.
export async function saveMercadoPagoTokens(tokens: MpTokenResponse) {
  const supabaseAdmin = getSupabaseAdmin();
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

  const { error } = await supabaseAdmin.from('mercadopago_connection').upsert({
    id: true,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    public_key: tokens.public_key ?? null,
    mp_user_id: tokens.user_id ? String(tokens.user_id) : null,
    token_expires_at: expiresAt,
    connected_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    pending_state: null,
    pending_state_created_at: null,
  });

  if (error) throw error;
}

export async function disconnectMercadoPago() {
  const supabaseAdmin = getSupabaseAdmin();
  const { error } = await supabaseAdmin.from('mercadopago_connection').delete().eq('id', true);
  if (error) throw error;
}

// Generates and stores a one-time OAuth state value, so the callback can
// verify the connect flow was actually started by an authenticated admin.
export async function createPendingOauthState(): Promise<string> {
  const supabaseAdmin = getSupabaseAdmin();
  const state = crypto.randomUUID();

  const { error } = await supabaseAdmin.from('mercadopago_connection').upsert({
    id: true,
    pending_state: state,
    pending_state_created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (error) throw error;
  return state;
}

// Verifies a state value coming back from Mercado Pago's redirect matches
// the one we generated, and that it isn't stale (10 minute window).
export async function consumePendingOauthState(state: string): Promise<boolean> {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from('mercadopago_connection')
    .select('pending_state, pending_state_created_at')
    .eq('id', true)
    .maybeSingle();

  if (error || !data?.pending_state || data.pending_state !== state) return false;

  const createdAt = data.pending_state_created_at ? new Date(data.pending_state_created_at).getTime() : 0;
  const isStale = Date.now() - createdAt > 10 * 60 * 1000;
  return !isStale;
}

// Returns a valid access token for the connected Mercado Pago account,
// refreshing it first if it's expired or about to expire. Returns null if
// no account is connected yet.
export async function getValidMercadoPagoAccessToken(): Promise<string | null> {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from('mercadopago_connection')
    .select('access_token, refresh_token, token_expires_at')
    .eq('id', true)
    .maybeSingle();

  if (error || !data?.access_token || !data.refresh_token) return null;

  const expiresAt = data.token_expires_at ? new Date(data.token_expires_at).getTime() : 0;
  const needsRefresh = Date.now() > expiresAt - 24 * 60 * 60 * 1000; // refresh 1 day early

  if (!needsRefresh) return data.access_token;

  const clientId = process.env.MERCADOPAGO_CLIENT_ID;
  const clientSecret = process.env.MERCADOPAGO_CLIENT_SECRET;
  if (!clientId || !clientSecret) return data.access_token; // can't refresh, use what we have

  try {
    const refreshRes = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
        refresh_token: data.refresh_token,
      }),
    });

    if (!refreshRes.ok) {
      console.error('Error refreshing Mercado Pago token:', await refreshRes.text());
      return data.access_token; // fall back to the (possibly expiring) token we have
    }

    const refreshed = (await refreshRes.json()) as MpTokenResponse;
    await saveMercadoPagoTokens(refreshed);
    return refreshed.access_token;
  } catch (err) {
    console.error('Error refreshing Mercado Pago token:', err);
    return data.access_token;
  }
}

export async function getMercadoPagoConnectionStatus() {
  const supabaseAdmin = getSupabaseAdmin();
  const { data } = await supabaseAdmin
    .from('mercadopago_connection')
    .select('mp_user_id, connected_at')
    .eq('id', true)
    .maybeSingle();

  return {
    connected: Boolean(data?.connected_at),
    mpUserId: data?.mp_user_id ?? null,
    connectedAt: data?.connected_at ?? null,
  };
}

// Verifies the request's Authorization: Bearer <token> belongs to a logged
// in user with role = 'admin' in `profiles`. Used to protect the OAuth
// start/status/disconnect endpoints from being triggered by strangers.
export async function requireAdmin(request: Request): Promise<boolean> {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) return false;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return false;

  const supabaseAuth = createClient(supabaseUrl, anonKey);
  const { data: userData, error: userError } = await supabaseAuth.auth.getUser(token);
  if (userError || !userData?.user) return false;

  const supabaseAdmin = getSupabaseAdmin();
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .maybeSingle();

  return profile?.role === 'admin';
}
