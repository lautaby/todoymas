// Server-side environment helper for Next.js & Cloudflare Workers OpenNext.

export async function getServerEnv(key: string): Promise<string | undefined> {
  // 1. Try process.env
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }

  // 2. Try globalThis.env (common in some CF Worker setups)
  if (typeof globalThis !== 'undefined' && (globalThis as any).env && (globalThis as any).env[key]) {
    return (globalThis as any).env[key];
  }

  // 3. Try globalThis directly (direct bindings)
  if (typeof globalThis !== 'undefined' && (globalThis as any)[key]) {
    return (globalThis as any)[key];
  }

  return undefined;
}
