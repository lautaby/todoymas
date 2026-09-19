import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/mercadopago-connection';
import { createEmployee, listStaff } from '@/lib/server/user-management';

// GET /api/admin/users - lista admin + empleados. Solo el dueño puede verla.
export async function GET(request: Request) {
  try {
    await requireAdmin(request);
  } catch {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  try {
    const staff = await listStaff();
    return NextResponse.json({ success: true, staff });
  } catch (error) {
    console.error('Error listing staff:', error);
    return NextResponse.json({ success: false, error: 'No se pudo obtener la lista de usuarios' }, { status: 500 });
  }
}

// POST /api/admin/users - crea un empleado nuevo. Solo el dueño puede
// hacerlo; el rol siempre queda en 'empleado' (nunca se puede crear otro
// admin desde acá).
export async function POST(request: Request) {
  try {
    await requireAdmin(request);
  } catch {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const employee = await createEmployee(body?.username, body?.password);
    return NextResponse.json({ success: true, employee });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo crear el usuario';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
