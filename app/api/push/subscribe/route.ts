import { NextResponse } from 'next/server';
import { getServiceSupabase, requireAdmin } from '@/lib/server/mercadopago-connection';
import { pushAuthError } from '@/lib/server/push';

// POST /api/push/subscribe  { subscription }  -> guarda este dispositivo
export async function POST(request: Request) {
  try {
    const user = await requireAdmin(request);
    const body = await request.json().catch(() => ({}));
    const sub = body?.subscription;
    const endpoint = sub?.endpoint;
    const p256dh = sub?.keys?.p256dh;
    const auth = sub?.keys?.auth;

    if (
      typeof endpoint !== 'string' ||
      !endpoint.startsWith('https://') ||
      typeof p256dh !== 'string' ||
      typeof auth !== 'string'
    ) {
      return NextResponse.json({ success: false, error: 'Suscripción inválida' }, { status: 400 });
    }

    const supabase = await getServiceSupabase();
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({ endpoint, p256dh, auth, user_id: user.id }, { onConflict: 'endpoint' });

    if (error) {
      console.error('Error guardando suscripción push:', error);
      return NextResponse.json({ success: false, error: 'No se pudo guardar el dispositivo' }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    const authResponse = pushAuthError(error);
    if (authResponse) return authResponse;
    console.error('Error en /api/push/subscribe:', error);
    return NextResponse.json({ success: false, error: 'Error inesperado' }, { status: 500 });
  }
}

// DELETE /api/push/subscribe  { endpoint }  -> desactiva este dispositivo
export async function DELETE(request: Request) {
  try {
    await requireAdmin(request);
    const body = await request.json().catch(() => ({}));
    const endpoint = body?.endpoint;
    if (typeof endpoint !== 'string') {
      return NextResponse.json({ success: false, error: 'Falta el dispositivo' }, { status: 400 });
    }
    const supabase = await getServiceSupabase();
    await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);
    return NextResponse.json({ success: true });
  } catch (error) {
    const authResponse = pushAuthError(error);
    if (authResponse) return authResponse;
    console.error('Error en DELETE /api/push/subscribe:', error);
    return NextResponse.json({ success: false, error: 'Error inesperado' }, { status: 500 });
  }
}
