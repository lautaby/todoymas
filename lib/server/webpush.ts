// Web Push (RFC 8030 + RFC 8291 aes128gcm + VAPID RFC 8292) con WebCrypto puro,
// para que funcione en Cloudflare Workers sin librerías de Node.

const enc = new TextEncoder();

export function b64uToBytes(s: string): Uint8Array {
  const pad = '='.repeat((4 - (s.length % 4)) % 4);
  const bin = atob((s + pad).replace(/-/g, '+').replace(/_/g, '/'));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function bytesToB64u(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function concat(...parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let offset = 0;
  for (const p of parts) {
    out.set(p, offset);
    offset += p.length;
  }
  return out;
}

async function hkdf(salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, length: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info }, key, length * 8);
  return new Uint8Array(bits);
}

// Clave pública VAPID (la que usa el navegador para suscribirse), derivada de la privada.
export function vapidPublicKeyFromJwk(jwk: JsonWebKey): string {
  return bytesToB64u(concat(new Uint8Array([4]), b64uToBytes(jwk.x as string), b64uToBytes(jwk.y as string)));
}

// Cifra el mensaje para un dispositivo (RFC 8291, content-encoding aes128gcm).
export async function encryptPayload(p256dh: string, auth: string, plaintext: Uint8Array): Promise<Uint8Array> {
  const uaPublic = b64uToBytes(p256dh);
  const authSecret = b64uToBytes(auth);

  const asKeys = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const asPublic = new Uint8Array(await crypto.subtle.exportKey('raw', asKeys.publicKey));
  const uaKey = await crypto.subtle.importKey('raw', uaPublic, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const ecdhSecret = new Uint8Array(
    await crypto.subtle.deriveBits({ name: 'ECDH', public: uaKey }, asKeys.privateKey, 256)
  );

  const keyInfo = concat(enc.encode('WebPush: info\0'), uaPublic, asPublic);
  const ikm = await hkdf(authSecret, ecdhSecret, keyInfo, 32);

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(salt, ikm, enc.encode('Content-Encoding: aes128gcm\0'), 16);
  const nonce = await hkdf(salt, ikm, enc.encode('Content-Encoding: nonce\0'), 12);

  const aesKey = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
  const padded = concat(plaintext, new Uint8Array([2])); // 0x02 = último (y único) bloque
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, aesKey, padded));

  const header = new Uint8Array(21 + asPublic.length);
  header.set(salt, 0);
  new DataView(header.buffer).setUint32(16, 4096); // tamaño de bloque
  header[20] = asPublic.length;
  header.set(asPublic, 21);

  return concat(header, cipher);
}

// Cabecera Authorization con VAPID (RFC 8292).
export async function vapidAuthorization(endpoint: string, privateJwk: JsonWebKey, subject: string): Promise<string> {
  const header = bytesToB64u(enc.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const claims = bytesToB64u(
    enc.encode(
      JSON.stringify({
        aud: new URL(endpoint).origin,
        exp: Math.floor(Date.now() / 1000) + 12 * 3600,
        sub: subject,
      })
    )
  );
  const key = await crypto.subtle.importKey('jwk', privateJwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const signature = new Uint8Array(
    await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, enc.encode(`${header}.${claims}`))
  );
  return `vapid t=${header}.${claims}.${bytesToB64u(signature)}, k=${vapidPublicKeyFromJwk(privateJwk)}`;
}

export async function buildWebPushRequest(opts: {
  subscription: { endpoint: string; p256dh: string; auth: string };
  payload: unknown;
  privateJwk: JsonWebKey;
  subject: string;
  ttl?: number;
  urgency?: 'very-low' | 'low' | 'normal' | 'high';
}) {
  const { subscription, payload, privateJwk, subject, ttl = 86400, urgency = 'high' } = opts;
  const body = await encryptPayload(subscription.p256dh, subscription.auth, enc.encode(JSON.stringify(payload)));
  const headers: Record<string, string> = {
    Authorization: await vapidAuthorization(subscription.endpoint, privateJwk, subject),
    'Content-Encoding': 'aes128gcm',
    'Content-Type': 'application/octet-stream',
    TTL: String(ttl),
    Urgency: urgency,
  };
  return { endpoint: subscription.endpoint, headers, body };
}
