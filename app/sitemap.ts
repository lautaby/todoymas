import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://todoymas.lautaby12.workers.dev';
  return [
    { url: `${base}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/catalogo`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/carrito`, changeFrequency: 'monthly', priority: 0.3 },
  ];
}
