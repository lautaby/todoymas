'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, ExternalLink, Loader2, Unlink, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';

const MP_ERROR_MESSAGES: Record<string, string> = {
  cancelado: 'Cancelaste la conexión con Mercado Pago.',
  faltan_datos: 'Mercado Pago no envió los datos esperados. Probá de nuevo.',
  estado_invalido: 'El enlace de conexión expiró o ya se usó. Probá de nuevo.',
  no_configurado: 'Falta configuración del lado del servidor para conectar Mercado Pago.',
  token_fallo: 'Mercado Pago rechazó la conexión. Probá de nuevo.',
  inesperado: 'Ocurrió un error inesperado al conectar. Probá de nuevo.',
};

function PagosContent() {
  const { session } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loadingStatus, setLoadingStatus] = useState(true);
  const [connected, setConnected] = useState(false);
  const [mpUserId, setMpUserId] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const accessToken = session?.access_token;

  async function fetchStatus() {
    if (!accessToken) return;
    setLoadingStatus(true);
    try {
      const res = await fetch('/api/mercadopago/oauth/status', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (data.success) {
        setConnected(data.connected);
        setMpUserId(data.mpUserId);
      }
    } catch {
      // silent - the card will just show "no conectado"
    } finally {
      setLoadingStatus(false);
    }
  }

  useEffect(() => {
    fetchStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  useEffect(() => {
    const mpConnected = searchParams.get('mp_connected');
    const mpError = searchParams.get('mp_error');

    if (mpConnected) {
      setNotice('¡Cuenta de Mercado Pago conectada con éxito!');
      router.replace('/admin/pagos');
    } else if (mpError) {
      setErrorMsg(MP_ERROR_MESSAGES[mpError] || 'No pudimos conectar Mercado Pago.');
      router.replace('/admin/pagos');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function handleConnect() {
    if (!accessToken) return;
    setConnecting(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/mercadopago/oauth/start', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'No pudimos iniciar la conexión.');
        setConnecting(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setErrorMsg('No pudimos iniciar la conexión.');
      setConnecting(false);
    }
  }

  async function handleDisconnect() {
    if (!accessToken) return;
    if (!confirm('¿Seguro que querés desconectar la cuenta de Mercado Pago? Los clientes no van a poder pagar con Mercado Pago hasta que la vuelvas a conectar.')) {
      return;
    }
    setDisconnecting(true);
    try {
      const res = await fetch('/api/mercadopago/oauth/disconnect', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (data.success) {
        setConnected(false);
        setMpUserId(null);
        setNotice('Cuenta de Mercado Pago desconectada.');
      } else {
        setErrorMsg(data.error || 'No pudimos desconectar la cuenta.');
      }
    } finally {
      setDisconnecting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pagos</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Conectá tu propia cuenta de Mercado Pago para poder cobrar. Nunca compartís tu contraseña ni ninguna clave con nadie: iniciás sesión directo en Mercado Pago.
        </p>
      </div>

      {notice && (
        <div className="rounded-lg border border-green-600/30 bg-green-600/10 text-green-700 dark:text-green-400 px-4 py-3 text-sm">
          {notice}
        </div>
      )}
      {errorMsg && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 text-destructive px-4 py-3 text-sm">
          {errorMsg}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            Mercado Pago
          </CardTitle>
          <CardDescription>
            Necesario para que los clientes puedan pagar online con tarjeta desde el checkout.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingStatus ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Revisando estado de la conexión...
            </div>
          ) : connected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400 font-medium">
                <CheckCircle2 className="h-4 w-4" />
                Cuenta conectada{mpUserId ? ` (ID de vendedor: ${mpUserId})` : ''}
              </div>
              <Button variant="outline" onClick={handleDisconnect} disabled={disconnecting}>
                {disconnecting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Unlink className="h-4 w-4 mr-2" />
                )}
                Desconectar cuenta
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <XCircle className="h-4 w-4" />
                Todavía no conectaste ninguna cuenta de Mercado Pago.
              </div>
              <Button onClick={handleConnect} disabled={connecting}>
                {connecting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ExternalLink className="h-4 w-4 mr-2" />
                )}
                Conectar con Mercado Pago
              </Button>
              <p className="text-xs text-muted-foreground">
                Te vamos a llevar a mercadopago.com para que inicies sesión con tu cuenta y autorices la conexión. No vas a escribir ninguna clave acá.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminPagosPage() {
  return (
    <Suspense fallback={null}>
      <PagosContent />
    </Suspense>
  );
}
