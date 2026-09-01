'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Truck, ShieldCheck, Store, Headphones } from 'lucide-react';
import { StoreLayout } from '@/components/store-layout';
import { ProductCard } from '@/components/product-card';
import { supabase, type Product, type Category } from '@/lib/supabase';
import { Fish, Cpu, Flower2, Home, Shirt, Sparkles, Tent, Camera } from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Fish, Cpu, Flower2, Home, Shirt, Sparkles, Tent, Camera,
};

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [featRes, catRes] = await Promise.all([
        supabase
          .from('products')
          .select('*')
          .eq('featured', true)
          .limit(8),
        supabase
          .from('categories')
          .select('*')
          .is('parent_id', null)
          .order('name'),
      ]);
      setFeatured(featRes.data as Product[] ?? []);
      setCategories(catRes.data as Category[] ?? []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <StoreLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/30 to-secondary">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/40 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative">
          <div className="flex flex-col items-center text-center py-20 md:py-28 max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
              <Sparkles className="h-4 w-4" />
              Mas de 8 rubros en una sola tienda
            </span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              De todo y mas
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mt-4 max-w-2xl">
              Pesca, tecnologia, hogar, belleza, camping, seguridad y mucho mas.
              Todo lo que buscas en un solo lugar, con envios a todo el pais.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link href="/catalogo">
                <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-8 py-3 font-medium transition-colors">
                  Ver catalogo
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
              <Link href="/catalogo?destacados=true">
                <button className="inline-flex items-center gap-2 border border-input bg-background hover:bg-accent rounded-lg px-8 py-3 font-medium transition-colors">
                  Productos destacados
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features bar */}
      <section className="border-b bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Truck, title: 'Envios a todo el pais', desc: 'Entregas rapidas' },
              { icon: Store, title: 'Retiro en local', desc: 'Sin costo adicional' },
              { icon: ShieldCheck, title: 'Compra segura', desc: 'Pago protegido' },
              { icon: Headphones, title: 'Atencion personalizada', desc: 'Lun a Sab' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{f.title}</p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Explora por categorias</h2>
          <Link href="/catalogo" className="text-sm text-primary hover:underline">
            Ver todo
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {categories.map((cat) => {
            const Icon = cat.icon ? iconMap[cat.icon] : Home;
            return (
              <Link
                key={cat.id}
                href={`/catalogo?categoria=${cat.slug}`}
                className="group flex flex-col items-center gap-2 p-4 rounded-xl border bg-card hover:border-primary/30 hover:shadow-md transition-all"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-xs font-medium text-center">{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured products */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Productos destacados</h2>
          <Link href="/catalogo?destacados=true" className="text-sm text-primary hover:underline">
            Ver mas
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* CTA banner */}
      <section className="container mx-auto px-4 py-12">
        <div className="relative overflow-hidden rounded-2xl bg-primary p-8 md:p-12 text-center">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
          </div>
          <div className="relative">
            <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground">
              ¿Buscas algo especifico?
            </h2>
            <p className="text-primary-foreground/80 mt-2 max-w-xl mx-auto">
              Explora nuestro catalogo completo con mas de 35 productos en 8 rubros diferentes.
            </p>
            <Link href="/catalogo">
              <button className="mt-6 inline-flex items-center gap-2 bg-white text-primary hover:bg-white/90 rounded-lg px-6 py-3 font-medium transition-colors">
                Ir al catalogo
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </StoreLayout>
  );
}
