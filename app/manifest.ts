import type { MetadataRoute } from 'next';

// Permite instalar la tienda/panel como app desde el navegador del celular
// (necesario para recibir notificaciones en iPhone).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Todo y Más',
    short_name: 'Todo y Más',
    description: 'Tienda online y panel de administración',
    start_url: '/admin/dashboard',
    scope: '/',
    display: 'standalone',
    background_color: '#F7F4EC',
    theme_color: '#0D7749',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
