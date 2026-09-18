import { NextResponse } from 'next/server';
import { getValidMercadoPagoAccessToken } from '@/lib/server/mercadopago-connection';
import { getServerEnv } from '@/lib/server/env';

interface OrderItemInput {
  product_id?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CreatePreferenceBody {
  orderId: string;
  items: OrderItemInput[];
  shippingCost?: number;
  payer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

// Splits "Juan Pérez" into { first_name: "Juan", last_name: "Pérez" } as
// Mercado Pago expects separate name fields for the payer.
function splitName(fullName?: string) {
  if (!fullName || !fullName.trim()) return { first_name: undefined, last_name: undefined };
  const parts = fullName.trim().split(/\s+/);
  const first_name = parts.shift();
  const last_name = parts.length > 0 ? parts.join(' ') : undefined;
  return { first_name, last_name };
}

export async function POST(request: Request) {
  try {
    const accessToken = await getValidMercadoPagoAccessToken();

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'El pago con Mercado Pago no está configurado todavía. Elegí transferencia o efectivo.',
        },
        { status: 501 }
      );
    }

    const body = (await request.json()) as CreatePreferenceBody;
    const { orderId, items, shippingCost = 0, payer } = body;

    if (!orderId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Pedido inválido' },
        { status: 400 }
      );
    }

    const rawSiteUrl = await getServerEnv('NEXT_PUBLIC_SITE_URL');
    const siteUrl = rawSiteUrl?.replace(/\/$/, '') ?? new URL(request.url).origin;

    const preferenceItems = items.map((item) => ({
      id: item.product_id,
      title: item.name.slice(0, 250),
      quantity: item.quantity,
      unit_price: Number(item.price),
      currency_id: 'ARS',
      picture_url: item.image || undefined,
    }));

    if (shippingCost > 0) {
      preferenceItems.push({
        id: 'envio',
        title: 'Costo de envío',
        quantity: 1,
        unit_price: Number(shippingCost),
        currency_id: 'ARS',
        picture_url: undefined,
      });
    }

    const { first_name, last_name } = splitName(payer?.name);

    const preferencePayload = {
      items: preferenceItems,
      payer: {
        name: first_name,
        surname: last_name,
        email: payer?.email || undefined,
        phone: payer?.phone ? { number: payer.phone } : undefined,
      },
      external_reference: orderId,
      back_urls: {
        success: `${siteUrl}/checkout/retorno?order=${orderId}`,
        pending: `${siteUrl}/checkout/retorno?order=${orderId}`,
        failure: `${siteUrl}/checkout/retorno?order=${orderId}`,
      },
      auto_return: 'approved',
      notification_url: `${siteUrl}/api/mercadopago/webhook`,
      statement_descriptor: 'TODOYMAS',
    };

    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preferencePayload),
    });

    const mpData = await mpRes.json();

    if (!mpRes.ok) {
      console.error('Mercado Pago preference error:', mpData);
      return NextResponse.json(
        { success: false, error: 'No pudimos iniciar el pago con Mercado Pago. Probá nuevamente.' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      preferenceId: mpData.id,
      initPoint: mpData.init_point,
    });
  } catch (error) {
    console.error('Error creating Mercado Pago preference:', error);
    return NextResponse.json(
      { success: false, error: 'Error al iniciar el pago' },
      { status: 500 }
    );
  }
}
