'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Store, Lock } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { LoginForm } from '@/components/admin/login-form';

export default function AdminLoginPage() {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && session) {
      router.replace('/admin/dashboard');
    }
  }, [session, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-accent/30 to-secondary p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-none border-2 border-foreground bg-primary text-primary-foreground mb-4">
            <Store className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold">Todo y mas</h1>
          <p className="text-muted-foreground mt-1 flex items-center justify-center gap-1">
            <Lock className="h-3 w-3" />
            Panel de administracion
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
