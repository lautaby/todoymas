import { NextResponse } from 'next/server';
import { getServiceSupabase, requireAdmin } from '@/lib/server/mercadopago-connection';
import { pushAuthError, sendPush } from '@/lib/server/push';

// POST /api/push/test  { endpoint }  -> manda un aviso de prueba a ese dispositivo
export async function POST(request: Request) {
  try {
    await requireAdmin(request);
    const body = await request.json().catch(() => ({}));
    const endpoint = body?.endpoint;
    if (typeof endpoint !== 'string') {
      return NextResponse.json({ success: false, error: 'Falta el dispositivo' }, { status: 400 });
    }

    const supabase = await getServiceSupabase();
    const { data: sub } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('endpoint', endpoint)
      .maybeSingle();

    if (!sub) {
      return NextResponse.json({ success: false, error: 'Este dispositivo no está registrado' }, { status: 404 });
    }

    const result = await sendPush(sub, {
      title: 'Avisos activados',
      body: 'Así vas a ver las notificaciones cuando alguien compre.',
      url: '/admin/pedidos',
      tag: 'test',
    });

    if (result === 'gone') {
      await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);
    }
    if (result !== 'ok') {
      return NextResponse.json({ success: false, error: 'No se pudo enviar el aviso de prueba' }, { status: 502 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    const authResponse = pushAuthError(error);
    if (authResponse) return authResponse;
    console.error('Error en /api/push/test:', error);
    return NextResponse.json({ success: false, error: 'Error inesperado' }, { status: 500 });
  }
}
