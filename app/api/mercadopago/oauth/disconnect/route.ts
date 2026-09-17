import { NextResponse } from 'next/server';
import { disconnectMercadoPago, requireAdmin } from '@/lib/server/mercadopago-connection';

// POST /api/mercadopago/oauth/disconnect
export async function POST(request: Request) {
  const isAdmin = await requireAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  try {
    await disconnectMercadoPago();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting Mercado Pago:', error);
    return NextResponse.json({ success: false, error: 'No se pudo desconectar' }, { status: 500 });
  }
}
