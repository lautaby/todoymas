import { NextResponse } from 'next/server';
import { createPendingOauthState, requireAdmin } from '@/lib/server/mercadopago-connection';

// POST /api/mercadopago/oauth/start
// Called from /admin/pagos with the logged-in admin's Supabase access token
// in the Authorization header. Returns the Mercado Pago authorization URL;
// the browser then navigates there directly (window.location.href).
export async function POST(request: Request) {
  try {
    const isAdmin = await requireAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const clientId = process.env.MERCADOPAGO_CLIENT_ID;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? new URL(request.url).origin;

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: 'Falta configurar MERCADOPAGO_CLIENT_ID en el servidor.' },
        { status: 501 }
      );
    }

    const state = await createPendingOauthState();
    const redirectUri = `${siteUrl}/api/mercadopago/oauth/callback`;

    const authUrl = new URL('https://auth.mercadopago.com/authorization');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('platform_id', 'mp');
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('state', state);

    return NextResponse.json({ success: true, url: authUrl.toString() });
  } catch (error) {
    console.error('Error starting Mercado Pago OAuth:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: 'Error al iniciar la conexión', details: errorMessage }, { status: 500 });
  }
}
