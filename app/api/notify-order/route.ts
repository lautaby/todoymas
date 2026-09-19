import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/server/mercadopago-connection';
import { notifyOrderOnce } from '@/lib/server/notify';

// Lo llama el checkout justo después de crear un pedido con pago offline
// (transferencia / efectivo). Los pagos online (Mercado Pago / GoCuotas)
// avisan desde sus webhooks cuando el pago se aprueba.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const orderId = body?.orderId;
    if (typeof orderId !== 'string' || !/^[0-9a-fA-F-]{36}$/.test(orderId)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const supabaseAdmin = await getServiceSupabase();
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('payment_method, channel, created_at')
      .eq('id', orderId)
      .maybeSingle();

    const recent = order ? Date.now() - new Date(order.created_at).getTime() < 15 * 60 * 1000 : false;
    if (
      !order ||
      order.channel !== 'online' ||
      !['transferencia', 'efectivo'].includes(order.payment_method) ||
      !recent
    ) {
      return NextResponse.json({ ok: true, notified: false });
    }

    await notifyOrderOnce(supabaseAdmin, orderId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error en /api/notify-order:', error);
    return NextResponse.json({ ok: true });
  }
}
