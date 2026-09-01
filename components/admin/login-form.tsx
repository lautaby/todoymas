'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { LogIn, AlertCircle, UserPlus } from 'lucide-react';

export function LoginForm() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;

        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email,
              role: 'admin',
            });

          if (profileError) {
            console.error('Profile creation error:', profileError);
          }
        }

        await signIn(email, password);
      } else {
        const { error: signInError } = await signIn(email, password);
        if (signInError) throw new Error(signInError);
      }

      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message ?? 'Error al iniciar sesion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border bg-card p-6 shadow-lg space-y-4">
      <div className="flex gap-2 p-1 bg-muted rounded-lg">
        <button
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'login' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
          onClick={() => { setMode('login'); setError(null); }}
        >
          Iniciar sesion
        </button>
        <button
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'signup' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
          onClick={() => { setMode('signup'); setError(null); }}
        >
          Crear cuenta
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
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
          <Label htmlFor="password">Contraseña</Label>
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
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            'Procesando...'
          ) : mode === 'login' ? (
            <><LogIn className="h-4 w-4 mr-2" /> Iniciar sesion</>
          ) : (
            <><UserPlus className="h-4 w-4 mr-2" /> Crear cuenta de admin</>
          )}
        </Button>
      </form>

      {mode === 'signup' && (
        <p className="text-xs text-muted-foreground text-center">
          Al crear una cuenta, se te asignara el rol de administrador (dueño).
        </p>
      )}
    </div>
  );
}
