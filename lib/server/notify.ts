import { getServerEnv } from './env';

const PAYMENT_LABELS: Record<string, string> = {
  mercadopago: 'Mercado Pago',
  gocuotas: 'GoCuotas',
  transferencia: 'Transferencia',
  efectivo: 'Efectivo',
};

function formatMoney(value: unknown): string {
  const n = Number(value) || 0;
  try {
    return '$' + n.toLocaleString('es-AR', { maximumFractionDigits: 0 });
  } catch {
    return '$' + Math.round(n);
  }
}

// Manda un aviso push al celular de la dueña (app "ntfy") por cada compra.
// - Solo avisa UNA vez por pedido (reclama orders.notified_at de forma atómica).
// - Nunca lanza errores: si algo falla, la compra sigue normal.
export async function notifyOrderOnce(supabaseAdmin: any, orderId: string) {
  let claimed = false;
  try {
    const topic = await getServerEnv('NTFY_TOPIC');
    if (!topic) return;

    const { data: order, error: claimError } = await supabaseAdmin
      .from('orders')
      .update({ notified_at: new Date().toISOString() })
      .eq('id', orderId)
      .eq('channel', 'online')
      .is('notified_at', null)
      .select('id, customer_name, total, payment_method, shipping_method, city, items')
      .maybeSingle();

    if (claimError) {
      console.error('No se pudo reservar el aviso del pedido:', claimError.message);
      return;
    }
    if (!order) return; // ya avisado, o no es un pedido online
    claimed = true;

    const items = Array.isArray(order.items) ? order.items : [];
    const itemsText = items
      .slice(0, 6)
      .map((i: any) => `${i.quantity ?? 1}x ${i.name ?? 'Producto'}`)
      .join(', ');
    const extra = items.length > 6 ? ` y ${items.length - 6} más` : '';
    const entrega =
      order.shipping_method === 'envio'
        ? `Envío${order.city ? ' a ' + order.city : ''}`
        : 'Retiro en local';
    const pago = PAYMENT_LABELS[order.payment_method] ?? order.payment_method ?? '';

    const server = ((await getServerEnv('NTFY_SERVER')) || 'https://ntfy.sh').replace(/\/$/, '');
    const siteUrl = (
      (await getServerEnv('NEXT_PUBLIC_SITE_URL')) || 'https://todoymas.lautaby12.workers.dev'
    ).replace(/\/$/, '');

    const res = await fetch(server, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic,
        title: `Nueva compra: ${formatMoney(order.total)}`,
        message: `${order.customer_name}\n${itemsText}${extra}\n${pago} · ${entrega}`,
        priority: 4,
        tags: ['shopping_cart'],
        click: `${siteUrl}/admin/pedidos`,
      }),
    });

    if (!res.ok) throw new Error(`ntfy respondió ${res.status}`);
  } catch (err) {
    console.error('Error enviando el aviso de compra:', err);
    if (claimed) {
      // Liberar la reserva para que un reintento pueda avisar.
      await supabaseAdmin.from('orders').update({ notified_at: null }).eq('id', orderId);
    }
  }
}
