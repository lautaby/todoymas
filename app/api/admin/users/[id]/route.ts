import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/mercadopago-connection';
import { deleteEmployee, resetEmployeePassword } from '@/lib/server/user-management';

// DELETE /api/admin/users/:id - revoca el acceso de un empleado. Nunca deja
// borrar una cuenta admin (chequeado también server-side en user-management).
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
  } catch {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  try {
    await deleteEmployee(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo eliminar el usuario';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

// PATCH /api/admin/users/:id - restablece la contraseña de un empleado.
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
  } catch {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    await resetEmployeePassword(params.id, body?.password);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo actualizar la contraseña';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
