'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-context';
import { LogIn, AlertCircle } from 'lucide-react';

export function LoginForm() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('admin@detodoymas.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: signInError } = await signIn(email, password);
      if (signInError) throw new Error(signInError);

      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message ?? 'Error al iniciar sesion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-none border-2 border-foreground bg-card p-6 shadow-brutal space-y-4 font-mono">
      <h2 className="text-sm font-bold uppercase tracking-wide text-center pb-2 border-b-2 border-foreground">
        Iniciar sesion
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="uppercase text-xs tracking-wide">Usuario</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@detodoymas.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="uppercase text-xs tracking-wide">Contraseña</Label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            minLength={6}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-none border-2 border-destructive bg-destructive/5 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            'Procesando...'
          ) : (
            <><LogIn className="h-4 w-4 mr-2" /> Iniciar sesion</>
          )}
        </Button>
      </form>
    </div>
  );
}
