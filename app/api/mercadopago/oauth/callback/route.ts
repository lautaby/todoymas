import { NextResponse } from 'next/server';
import { consumePendingOauthState, saveMercadoPagoTokens } from '@/lib/server/mercadopago-connection';
import { getServerEnv } from '@/lib/server/env';

// GET /api/mercadopago/oauth/callback
// Mercado Pago redirects the client's browser here after they log in to
// their own account and authorize the connection. We never see their
// password - only this one-time `code`, which we exchange server-side for
// an access token tied to their account.
export async function GET(request: Request) {
  const rawSiteUrl = await getServerEnv('NEXT_PUBLIC_SITE_URL');
  const siteUrl = rawSiteUrl?.replace(/\/$/, '') ?? new URL(request.url).origin;
  const adminPagosUrl = `${siteUrl}/admin/pagos`;

  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const errorParam = url.searchParams.get('error');

    if (errorParam) {
      // The client cancelled the authorization on Mercado Pago's side.
      return NextResponse.redirect(`${adminPagosUrl}?mp_error=cancelado`);
    }

    if (!code || !state) {
      return NextResponse.redirect(`${adminPagosUrl}?mp_error=faltan_datos`);
    }

    const stateIsValid = await consumePendingOauthState(state);
    if (!stateIsValid) {
      return NextResponse.redirect(`${adminPagosUrl}?mp_error=estado_invalido`);
    }

    const clientId = await getServerEnv('MERCADOPAGO_CLIENT_ID');
    const clientSecret = await getServerEnv('MERCADOPAGO_CLIENT_SECRET');
    if (!clientId || !clientSecret) {
      return NextResponse.redirect(`${adminPagosUrl}?mp_error=no_configurado`);
    }

    const redirectUri = `${siteUrl}/api/mercadopago/oauth/callback`;

    const tokenRes = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenRes.json().catch(() => ({}));

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('Error exchanging Mercado Pago OAuth code:', tokenData);
      return NextResponse.redirect(`${adminPagosUrl}?mp_error=token_fallo`);
    }

    await saveMercadoPagoTokens(tokenData);

    return NextResponse.redirect(`${adminPagosUrl}?mp_connected=1`);
  } catch (error) {
    console.error('Error in Mercado Pago OAuth callback:', error);
    return NextResponse.redirect(`${adminPagosUrl}?mp_error=inesperado`);
  }
}
