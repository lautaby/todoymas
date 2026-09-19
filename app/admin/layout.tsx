'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { session, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === '/admin';
  // Pagos (credenciales de Mercado Pago) y Usuarios son solo para el dueño.
  // El servidor ya rechaza estas acciones si no sos admin (requireAdmin en
  // las rutas /api correspondientes); esto es una segunda barrera para que
  // un empleado ni siquiera pueda entrar a la pantalla escribiendo la URL.
  const isAdminOnlyPage = pathname.startsWith('/admin/pagos') || pathname.startsWith('/admin/usuarios');

  useEffect(() => {
    if (!loading && !session && !isLoginPage) {
      router.replace('/admin');
      return;
    }
    if (!loading && profile && isAdminOnlyPage && profile.role !== 'admin') {
      router.replace('/admin/dashboard');
    }
  }, [session, profile, loading, isLoginPage, isAdminOnlyPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Evita el "flash" del contenido de una pantalla admin-only mientras el
  // efecto de arriba redirige a un empleado.
  if (isAdminOnlyPage && profile.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-secondary/30">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
