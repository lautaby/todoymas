import { NextResponse } from 'next/server';

// GoCuotas "API Redirect V1" - https://www.gocuotas.com/api_redirect_docs
// Flow: 1) authenticate with email/password to get a token, 2) create a
// checkout resource with that token, 3) redirect the buyer to the url_init
// the checkout response gives back, 4) GoCuotas calls our webhook when the
// payment is confirmed (see app/api/gocuotas/webhook/route.ts).

const GOCUOTAS_BASE_URL = 'https://www.gocuotas.com/api_redirect/v1';

interface CreateCheckoutBody {
  orderId: string;
  amount: number; // ARS, not cents
  payer?: {
    email?: string;
    phone?: string;
  };
}

// The Postman docs for the Authentication endpoint don't show an example
// response body, so we don't know the exact field name GoCuotas uses for
// the token. We try the common ones here - if this ever logs "Respuesta de
// autenticación inesperada", check the logged raw response and add the
// right key to this list.
function extractToken(data: any): string | undefined {
  return data?.token || data?.access_token || data?.auth_token || data?.jwt;
}

// Same situation for the Checkout response: the docs don't show an example
// body, but the API's own introduction says to redirect the buyer to the
// checkout's "url_init". Fall back to a couple of likely alternate names.
function extractInitUrl(data: any): string | undefined {
  return data?.url_init || data?.init_url || data?.url;
}

export async function POST(request: Request) {
  try {
    const email = process.env.GOCUOTAS_EMAIL;
    const password = process.env.GOCUOTAS_PASSWORD;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'El pago en cuotas con GoCuotas no está configurado todavía. Elegí otro método de pago.',
        },
        { status: 501 }
      );
    }

    const body = (await request.json()) as CreateCheckoutBody;
    const { orderId, amount, payer } = body;

    if (!orderId || !amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Pedido inválido' },
        { status: 400 }
      );
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ??
      new URL(request.url).origin;

    // 1. Authenticate (email/password go as query params per GoCuotas' docs).
    const authUrl = new URL(`${GOCUOTAS_BASE_URL}/authentication`);
    authUrl.searchParams.set('email', email);
    authUrl.searchParams.set('password', password);

    const authRes = await fetch(authUrl.toString(), { method: 'POST' });
    const authData = await authRes.json().catch(() => ({}));

    if (!authRes.ok) {
      console.error('GoCuotas authentication error:', authData);
      return NextResponse.json(
        { success: false, error: 'No pudimos autenticarnos con GoCuotas.' },
        { status: 502 }
      );
    }

    const token = extractToken(authData);
    if (!token) {
      console.error('Respuesta de autenticación inesperada de GoCuotas:', authData);
      return NextResponse.json(
        { success: false, error: 'Respuesta inesperada de GoCuotas al autenticar.' },
        { status: 502 }
      );
    }

    // 2. Create the checkout resource.
    const checkoutPayload = {
      amount_in_cents: Math.round(Number(amount) * 100),
      url_success: `${siteUrl}/checkout/retorno?order=${orderId}`,
      url_failure: `${siteUrl}/checkout/retorno?order=${orderId}`,
      order_reference_id: orderId,
      webhook_url: `${siteUrl}/api/gocuotas/webhook`,
      email: payer?.email || '',
      phone_number: payer?.phone || '',
    };

    const checkoutRes = await fetch(`${GOCUOTAS_BASE_URL}/checkouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(checkoutPayload),
    });

    const checkoutData = await checkoutRes.json().catch(() => ({}));

    if (!checkoutRes.ok) {
      console.error('GoCuotas checkout creation error:', checkoutData);
      return NextResponse.json(
        { success: false, error: 'No pudimos iniciar el pago en cuotas con GoCuotas. Probá nuevamente.' },
        { status: 502 }
      );
    }

    const initUrl = extractInitUrl(checkoutData);
    if (!initUrl) {
      console.error('Respuesta de checkout inesperada de GoCuotas:', checkoutData);
      return NextResponse.json(
        { success: false, error: 'Respuesta inesperada de GoCuotas al crear el checkout.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, initUrl });
  } catch (error) {
    console.error('Error creating GoCuotas checkout:', error);
    return NextResponse.json(
      { success: false, error: 'Error al iniciar el pago con GoCuotas' },
      { status: 500 }
    );
  }
}
