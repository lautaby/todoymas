// Server-side environment helper for Next.js & Cloudflare Workers OpenNext.

export async function getServerEnv(key: string): Promise<string | undefined> {
  // 1. Try process.env
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }

  // 2. Try @opennextjs/cloudflare getCloudflareContext
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    const cfContext = await getCloudflareContext();
    if (cfContext?.env && (cfContext.env as Record<string, any>)[key]) {
      return (cfContext.env as Record<string, any>)[key];
    }
  } catch {
    // Ignore if not in Cloudflare context or at build time
  }

  // 3. Try globalThis bindings
  if (typeof globalThis !== 'undefined') {
    const g = globalThis as Record<string, any>;
    if (g[key]) return g[key];
    if (g.env && g.env[key]) return g.env[key];
    if (g.process?.env && g.process.env[key]) return g.process.env[key];
    if (g.__env && g.__env[key]) return g.__env[key];
  }

  return undefined;
}
