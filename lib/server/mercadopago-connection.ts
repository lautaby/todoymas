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

interface MpTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user_id: number;
}

export async function getMercadoPagoToken(storeId: string) {
  const supabase = await getServiceSupabase();
  
  const { data, error } = await supabase
    .from('mercadopago_connection')
    .select('*')
    .eq('id', storeId)
    .single();

  if (error || !data) {
    throw new Error('No se encontró conexión de Mercado Pago');
  }

  return data.access_token;
}
