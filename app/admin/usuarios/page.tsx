'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, KeyRound, ShieldCheck, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';

type StaffMember = {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'empleado';
  created_at: string;
};

export default function UsuariosPage() {
  const { session } = useAuth();
  const { toast } = useToast();
  const accessToken = session?.access_token;

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const [resetTarget, setResetTarget] = useState<StaffMember | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<StaffMember | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadStaff() {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (data.success) {
        setStaff(data.staff);
      } else {
        toast({ title: 'No se pudo cargar la lista', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'No se pudo cargar la lista de usuarios', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStaff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  function openCreate() {
    setUsername('');
    setPassword('');
    setCreateOpen(true);
  }

  async function handleCreate() {
    if (!accessToken) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!data.success) {
        toast({ title: 'No se pudo crear el usuario', description: data.error, variant: 'destructive' });
        return;
      }
      toast({ title: 'Empleado creado', description: `Ya puede entrar a /admin con el usuario "${username.trim()}"` });
      setCreateOpen(false);
      loadStaff();
    } catch {
      toast({ title: 'No se pudo crear el usuario', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    if (!accessToken || !resetTarget) return;
    setResetting(true);
    try {
      const res = await fetch(`/api/admin/users/${resetTarget.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ password: resetPassword }),
      });
      const data = await res.json();
      if (!data.success) {
        toast({ title: 'No se pudo cambiar la contraseña', description: data.error, variant: 'destructive' });
        return;
      }
      toast({ title: 'Contraseña actualizada' });
      setResetTarget(null);
      setResetPassword('');
    } catch {
      toast({ title: 'No se pudo cambiar la contraseña', variant: 'destructive' });
    } finally {
      setResetting(false);
    }
  }

  async function handleDelete() {
    if (!accessToken || !deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (!data.success) {
        toast({ title: 'No se pudo eliminar el usuario', description: data.error, variant: 'destructive' });
        return;
      }
      toast({ title: 'Usuario eliminado' });
      setDeleteTarget(null);
      setStaff((prev) => prev.filter((s) => s.id !== deleteTarget.id));
    } catch {
      toast({ title: 'No se pudo eliminar el usuario', variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Usuarios</h1>
          <p className="text-muted-foreground">Cuentas de acceso al panel de administración</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo empleado
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cómo funciona</CardTitle>
          <CardDescription>
            Cada empleado tiene su propio usuario y contraseña, sin acceso a Pagos ni a esta pantalla.
            Todas las ventas de mostrador quedan registradas con qué usuario las hizo, y los empleados
            no pueden borrar pedidos, cambiar precios de catálogo, ni marcar un pago online como
            aprobado a mano.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="border rounded-lg bg-card divide-y">
        {loading && <div className="p-6 text-center text-muted-foreground text-sm">Cargando...</div>}
        {!loading && staff.length === 0 && (
          <div className="p-6 text-center text-muted-foreground text-sm">No hay usuarios todavía.</div>
        )}
        {!loading &&
          staff.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                  {s.role === 'admin' ? <ShieldCheck className="h-4 w-4" /> : <UserIcon className="h-4 w-4" />}
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{s.username}</p>
                  <Badge variant={s.role === 'admin' ? 'default' : 'secondary'} className="mt-0.5 capitalize">
                    {s.role === 'admin' ? 'Dueño' : 'Empleado'}
                  </Badge>
                </div>
              </div>
              {s.role !== 'admin' && (
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Restablecer contraseña"
                    onClick={() => {
                      setResetPassword('');
                      setResetTarget(s);
                    }}
                  >
                    <KeyRound className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Eliminar"
                    onClick={() => setDeleteTarget(s)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              )}
            </div>
          ))}
      </div>

      {/* Crear empleado */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo empleado</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Usuario</Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ej: maria"
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">
                Sin espacios ni @. El empleado va a entrar a /admin con este usuario y su contraseña.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>Contraseña</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={saving || !username.trim() || !password}>
              {saving ? 'Creando...' : 'Crear empleado'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restablecer contraseña */}
      <Dialog open={!!resetTarget} onOpenChange={(open) => !open && setResetTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restablecer contraseña de {resetTarget?.username}</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label>Contraseña nueva</Label>
            <Input
              type="password"
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetTarget(null)}>
              Cancelar
            </Button>
            <Button onClick={handleReset} disabled={resetting || !resetPassword}>
              {resetting ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Eliminar */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar a {deleteTarget?.username}?</AlertDialogTitle>
            <AlertDialogDescription>
              Pierde el acceso al panel de inmediato. Las ventas que ya registró quedan en el historial.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
