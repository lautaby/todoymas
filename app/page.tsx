'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Truck, ShieldCheck, Store, Headphones, Leaf } from 'lucide-react';
import { StoreLayout } from '@/components/store-layout';
import { ProductCard } from '@/components/product-card';
import { OrganicBlob, LeafScatter, LeafSprig } from '@/components/decorative-plants';
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
      <section className="relative overflow-hidden bg-hearth">
        <OrganicBlob className="absolute -right-32 -top-32 h-80 w-80 text-primary/25 animate-drift sm:-right-40 sm:-top-40 sm:h-[560px] sm:w-[560px] md:-right-24 md:-top-24" />
        <OrganicBlob className="absolute -left-28 bottom-[-6rem] h-64 w-64 text-accent/20 opacity-80 animate-drift sm:-left-52 sm:bottom-[-12rem] sm:h-[460px] sm:w-[460px]" />
        <LeafScatter className="absolute right-3 top-3 h-28 w-28 text-primary sm:right-8 sm:top-8 sm:h-64 sm:w-64" />
        <div className="container mx-auto px-4 relative">
          <div className="flex flex-col items-center text-center py-20 md:py-28 max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground mb-6">
              <Leaf className="h-4 w-4 text-primary" />
              Toda la variedad, en un solo lugar
            </span>
            <h1 className="text-6xl md:text-8xl font-script font-normal tracking-tight text-primary drop-shadow-sm">
              Todo y Más
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mt-5 max-w-2xl">
              Pesca, tecnología, hogar, belleza, camping, seguridad y mucho más.
              Todo lo que buscás, en un solo lugar, con envíos a todo el país.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Link href="/catalogo">
                <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-8 py-3 font-semibold shadow-soft hover:shadow-soft-md hover:-translate-y-0.5 transition-all">
                  Ver catálogo
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
              <Link href="/catalogo?destacados=true">
                <button className="inline-flex items-center gap-2 bg-background border border-border rounded-full px-8 py-3 font-semibold hover:bg-secondary hover:-translate-y-0.5 transition-all">
                  Destacados
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features bar */}
      <section className="relative overflow-hidden border-y border-border bg-secondary/40">
        <LeafSprig className="absolute -bottom-4 left-2 h-20 w-12 text-primary sm:-bottom-6 sm:left-6 sm:h-32 sm:w-20" />
        <LeafSprig className="absolute -top-6 right-3 h-16 w-10 text-accent rotate-[160deg] sm:-top-10 sm:right-10 sm:h-28 sm:w-16" />
        <div className="container mx-auto px-4 py-8 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: 'Envíos a todo el país', desc: 'Entregas rápidas' },
              { icon: Store, title: 'Retiro en local', desc: 'Sin costo adicional' },
              { icon: ShieldCheck, title: 'Compra segura', desc: 'Pago protegido' },
              { icon: Headphones, title: 'Atención personalizada', desc: 'Lun a Sáb' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{f.title}</p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="relative overflow-hidden container mx-auto px-4 py-14">
        <LeafSprig className="pointer-events-none absolute -top-4 -left-2 h-24 w-14 text-primary opacity-[0.09] -rotate-12 sm:h-36 sm:w-20" />
        <div className="flex items-center justify-between mb-6 relative">
          <h2 className="text-2xl md:text-3xl font-display font-semibold tracking-tight">Explorá por categorías</h2>
          <Link href="/catalogo" className="text-sm font-medium text-primary hover:underline">
            Ver todo
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 relative">
          {categories.map((cat) => {
            const Icon = cat.icon ? iconMap[cat.icon] : Home;
            return (
              <Link
                key={cat.id}
                href={`/catalogo?categoria=${cat.slug}`}
                className="group flex flex-col items-center gap-2.5 p-4 rounded-3xl border border-border bg-card shadow-soft hover:shadow-soft-md hover:-translate-y-1 transition-all"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-xs font-medium text-center">{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured products */}
      <section className="relative overflow-hidden container mx-auto px-4 py-10">
        <LeafScatter className="pointer-events-none absolute -right-6 bottom-0 h-32 w-32 text-accent opacity-[0.1] sm:h-52 sm:w-52" />
        <div className="flex items-center justify-between mb-6 relative">
          <h2 className="text-2xl md:text-3xl font-display font-semibold tracking-tight">Productos destacados</h2>
          <Link href="/catalogo?destacados=true" className="text-sm font-medium text-primary hover:underline">
            Ver más
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 relative">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-3xl border border-border bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 relative">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* CTA banner */}
      <section className="container mx-auto px-4 py-14">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-primary p-8 md:p-14 text-center shadow-soft-lg">
          <OrganicBlob className="absolute -right-28 -bottom-28 h-80 w-80 text-primary-foreground opacity-15" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-tight text-primary-foreground">
              ¿Buscás algo específico?
            </h2>
            <p className="text-primary-foreground/80 mt-3 max-w-xl mx-auto">
              Explorá nuestro catálogo completo con una gran variedad de productos y rubros.
            </p>
            <Link href="/catalogo">
              <button className="mt-7 inline-flex items-center gap-2 bg-background text-foreground rounded-full px-6 py-3 font-semibold hover:-translate-y-0.5 transition-all shadow-soft">
                Ir al catálogo
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </StoreLayout>
  );
}
