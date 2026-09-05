'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Store, Mail, Phone, MapPin } from 'lucide-react';
import { supabase, type Category } from '@/lib/supabase';

export function Footer() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .is('parent_id', null)
        .order('name')
        .limit(6);
      if (data) setCategories(data as Category[]);
    }
    load();
  }, []);

  return (
    <footer className="border-t-2 border-foreground bg-foreground text-background mt-16 font-mono">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-none border-2 border-background bg-primary text-primary-foreground">
                <Store className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold uppercase tracking-tight">De todo y mas</span>
            </div>
            <p className="text-sm text-background/70">
              Tu tienda de confianza con una gran variedad de rubros y productos, todo en un mismo lugar.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3 uppercase text-primary">Categorias</h3>
            <ul className="space-y-2 text-sm text-background/70">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link href={`/catalogo?categoria=${cat.slug}`} className="hover:text-primary transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/catalogo" className="hover:text-primary transition-colors">
                  Ver todas &rarr;
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 uppercase text-primary">Informacion</h3>
            <ul className="space-y-2 text-sm text-background/70">
              <li><Link href="/catalogo" className="hover:text-primary transition-colors">Catalogo completo</Link></li>
              <li><Link href="/carrito" className="hover:text-primary transition-colors">Carrito</Link></li>
              <li><Link href="/checkout" className="hover:text-primary transition-colors">Checkout</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 uppercase text-primary">Contacto</h3>
            <ul className="space-y-2 text-sm text-background/70">
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0" /> Av. Principal 1234, CABA</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0" /> (11) 5555-1234</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0" /> info@detodoymas.com</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 mt-8 pt-6 text-center text-xs text-background/60 uppercase tracking-wider">
          <p>&copy; {new Date().getFullYear()} De todo y mas - Todos los derechos reservados</p>
        </div>
      </div>
    </footer>
  );
}
