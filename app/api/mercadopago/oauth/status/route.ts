import { NextResponse } from 'next/server';
import { getMercadoPagoConnectionStatus, requireAdmin } from '@/lib/server/mercadopago-connection';

// GET /api/mercadopago/oauth/status
// Returns only whether an account is connected (and its Mercado Pago user
// id, which isn't sensitive) - never the tokens themselves.
export async function GET(request: Request) {
  const isAdmin = await requireAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  const status = await getMercadoPagoConnectionStatus();
  return NextResponse.json({ success: true, ...status });
}
