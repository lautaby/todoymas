// Server-side environment helper for Next.js & Cloudflare Workers OpenNext.
export async function getServerEnv(key: string): Promise<string | undefined> {
  const g = globalThis as any;
  const val = (process.env as any)[key] || 
              g[key] || 
              g.env?.[key] || 
              (typeof process !== 'undefined' ? process.env[key] : undefined);
  return val;
}
