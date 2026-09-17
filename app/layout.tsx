import './globals.css';
import type { Metadata } from 'next';
import { Fraunces, Nunito_Sans, JetBrains_Mono, Pacifico } from 'next/font/google';
import { CartProvider } from '@/lib/cart-context';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from '@/components/ui/toaster';

const nunitoSans = Nunito_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

const pacifico = Pacifico({
  subsets: ['latin'],
  variable: '--font-script',
  weight: ['400'],
});

export const metadata: Metadata = {
  title: 'Todo y Más - Tienda Online',
  description: 'Tu tienda de confianza: variedad de rubros y productos, sin vueltas.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${nunitoSans.variable} ${fraunces.variable} ${jetbrainsMono.variable} ${pacifico.variable} font-sans`}>
        <AuthProvider>
          <CartProvider>
            {children}
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
