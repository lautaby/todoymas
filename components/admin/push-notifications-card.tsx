'use client';

import { useCallback, useEffect, useState } from 'react';
import { BellOff, BellRing, Loader2, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';

type Status = 'loading' | 'unsupported' | 'ios-install' | 'denied' | 'off' | 'on';

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export function PushNotificationsCard() {
  const { session, profile } = useAuth();
  const [status, setStatus] = useState<Status>('loading');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const token = session?.access_token;

  const detect = useCallback(async () => {
    const ua = navigator.userAgent;
    const isIOS =
      /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
    const hasPush = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

    if (!hasPush) {
      setStatus(isIOS && !standalone ? 'ios-install' : 'unsupported');
      return;
    }
    if (Notification.permission === 'denied') {
      setStatus('denied');
      return;
    }
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      setStatus(sub && Notification.permission === 'granted' ? 'on' : 'off');
    } catch {
      setStatus('off');
    }
  }, []);

  useEffect(() => {
    detect();
  }, [detect]);

  const authHeaders = (): Record<string, string> => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token ?? ''}`,
  });

  async function sendTest(endpoint: string) {
    try {
      const res = await fetch('/api/push/test', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ endpoint }),
      });
      if (!res.ok) throw new Error();
      setMessage('Listo. Te mandamos un aviso de prueba: si no lo ves en unos segundos, avisanos.');
    } catch {
      setMessage('Se activó, pero no pudimos mandar el aviso de prueba.');
    }
  }

  async function enable() {
    if (!token) return;
    setBusy(true);
    setMessage(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus(permission === 'denied' ? 'denied' : 'off');
        return;
      }
      await navigator.serviceWorker.register('/sw.js');
      const reg = await navigator.serviceWorker.ready;

      const keyRes = await fetch('/api/push/public-key');
      const keyData = await keyRes.json().catch(() => ({}));
      if (!keyRes.ok || !keyData.key) {
        throw new Error(keyData.error || 'El servidor todavía no tiene configuradas las notificaciones.');
      }

      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(keyData.key) as unknown as BufferSource,
        });
      }

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ subscription: sub.toJSON() }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'No se pudo guardar este dispositivo.');
      }

      setStatus('on');
      await sendTest(sub.endpoint);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'No se pudieron activar los avisos.');
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    setMessage(null);
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: authHeaders(),
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setStatus('off');
    } catch {
      setMessage('No se pudieron desactivar los avisos.');
    } finally {
      setBusy(false);
    }
  }

  // Solo la dueña recibe los avisos de compras.
  if (profile?.role !== 'admin') return null;

  return (
    <Card>
      <CardContent className="pt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            {status === 'on' ? <BellRing className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
          </div>
          <div>
            <p className="font-semibold">Avisos de compras en este dispositivo</p>
            <p className="text-sm text-muted-foreground">
              {status === 'on' &&
                'Activados: te llega una notificación cada vez que alguien compra en la tienda.'}
              {status === 'off' &&
                'Activalos para que este celular o compu te avise apenas alguien compre.'}
              {status === 'loading' && 'Revisando...'}
              {status === 'denied' &&
                'Bloqueaste las notificaciones de este sitio. Habilitalas desde los permisos del navegador (el candado junto a la dirección) y volvé a intentar.'}
              {status === 'unsupported' &&
                'Este navegador no permite notificaciones. Probá con Chrome o Edge.'}
              {status === 'ios-install' &&
                'En iPhone: abrí este sitio en Safari, tocá Compartir → "Agregar a inicio", abrí la tienda desde el ícono nuevo y activá los avisos desde acá.'}
            </p>
            {message && <p className="mt-1 text-sm text-primary">{message}</p>}
          </div>
        </div>

        {status === 'off' && (
          <Button onClick={enable} disabled={busy || !token} className="shrink-0">
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Smartphone className="mr-2 h-4 w-4" />}
            Activar avisos
          </Button>
        )}
        {status === 'on' && (
          <Button variant="outline" onClick={disable} disabled={busy} className="shrink-0">
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Desactivar
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
