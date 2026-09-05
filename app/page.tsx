'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Truck, ShieldCheck, Store, Headphones, Leaf } from 'lucide-react';
import { StoreLayout } from '@/components/store-layout';
import { ProductCard } from '@/components/product-card';
import { supabase, type Product, type Category } from '@/lib/supabase';
import { Fish, Cpu, Flower2, Home, Shirt, Sparkles, Tent, Camera } from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Fish, Cpu, Flower2, Home, Shirt, Sparkles, Tent, Camera,
};

function OrganicBlob({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 600"
      className={className}
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M431.5 73.5C495 116 552 178 566 250.5c14 72.5-14 155.5-63.5 216.5C453 528 380 566 305 570.5c-75 4.5-153.5-24.5-207-79.5C44.5 436 16 355.5 21.5 278 27 200.5 66.5 126 128 82C189.5 38 273 24.5 344 33c71 8.5 24 -1.5 87.5 40.5Z"
      />
    </svg>
  );
}

function LeafScatter({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 600"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M120 460c60-140 200-220 340-200-20 140-140 240-280 260-30 4-50-30-60-60Z"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.35"
      />
      <path d="M150 445c70-110 190-170 290-165" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <circle cx="470" cy="120" r="5" fill="currentColor" opacity="0.3" />
      <circle cx="500" cy="150" r="3" fill="currentColor" opacity="0.25" />
      <circle cx="440" cy="95" r="3" fill="currentColor" opacity="0.25" />
    </svg>
  );
}

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
        <OrganicBlob className="absolute -right-40 -top-40 h-[560px] w-[560px] text-primary/25 animate-drift md:-right-24 md:-top-24" />
        <OrganicBlob className="absolute -left-52 bottom-[-12rem] h-[460px] w-[460px] text-accent/20 opacity-80 hidden md:block animate-drift" />
        <LeafScatter className="absolute right-8 top-8 h-64 w-64 text-primary hidden lg:block" />
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
      <section className="border-y border-border bg-secondary/40">
        <div className="container mx-auto px-4 py-8">
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
      <section className="container mx-auto px-4 py-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-display font-semibold tracking-tight">Explorá por categorías</h2>
          <Link href="/catalogo" className="text-sm font-medium text-primary hover:underline">
            Ver todo
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
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
      <section className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-display font-semibold tracking-tight">Productos destacados</h2>
          <Link href="/catalogo?destacados=true" className="text-sm font-medium text-primary hover:underline">
            Ver más
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-3xl border border-border bg-muted animate-pulse" />
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
