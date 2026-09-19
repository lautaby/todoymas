import { NextResponse } from 'next/server';
import { getServerEnv } from '@/lib/server/env';
import { vapidPublicKeyFromJwk } from '@/lib/server/webpush';

// Sin esto Next intenta generar la respuesta en el build (sin variables) y la deja fija.
export const dynamic = 'force-dynamic';

// Clave pública VAPID: no es secreta, el navegador la necesita para suscribirse.
// Se deriva de la clave privada guardada como secret en Cloudflare.
export async function GET() {
  const raw = await getServerEnv('VAPID_PRIVATE_KEY');
  if (!raw) {
    return NextResponse.json(
      { success: false, error: 'Las notificaciones todavía no están configuradas en el servidor.' },
      { status: 501 }
    );
  }
  try {
    return NextResponse.json({ success: true, key: vapidPublicKeyFromJwk(JSON.parse(raw)) });
  } catch {
    return NextResponse.json(
      { success: false, error: 'La clave de notificaciones del servidor es inválida.' },
      { status: 500 }
    );
  }
}
