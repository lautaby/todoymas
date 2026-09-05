'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Leaf, Phone, MapPin } from 'lucide-react';
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
    <footer className="bg-footer text-footer-foreground mt-16">
      <div className="h-1 w-full bg-gradient-to-r from-primary via-accent to-primary opacity-70" />
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Leaf className="h-5 w-5" />
              </div>
              <span className="text-lg font-display font-semibold tracking-tight">Todo y mas</span>
            </div>
            <p className="text-sm text-footer-foreground/70">
              Tu tienda de confianza, con una gran variedad de rubros y productos, todo en un mismo lugar.
            </p>
          </div>

          <div>
            <h3 className="font-display font-semibold mb-3 text-primary/90">Categorías</h3>
            <ul className="space-y-2 text-sm text-footer-foreground/70">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link href={`/catalogo?categoria=${cat.slug}`} className="hover:text-primary transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/catalogo" className="hover:text-primary transition-colors">
                  Ver todas
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display font-semibold mb-3 text-primary/90">Información</h3>
            <ul className="space-y-2 text-sm text-footer-foreground/70">
              <li><Link href="/catalogo" className="hover:text-primary transition-colors">Catálogo completo</Link></li>
              <li><Link href="/carrito" className="hover:text-primary transition-colors">Carrito</Link></li>
              <li><Link href="/checkout" className="hover:text-primary transition-colors">Checkout</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display font-semibold mb-3 text-primary/90">Contacto</h3>
            <ul className="space-y-2 text-sm text-footer-foreground/70">
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0" /> Paseo España, Avenida España 86, Local 8</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0" /> +54 9 261 665-7183</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-footer-foreground/10 mt-8 pt-6 text-center text-xs text-footer-foreground/50">
          <p>&copy; {new Date().getFullYear()} Todo y mas · Todos los derechos reservados</p>
        </div>
      </div>
    </footer>
  );
}
