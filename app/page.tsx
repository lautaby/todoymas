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
      <section className="relative overflow-hidden bg-background border-b-2 border-foreground bg-grid">
        <div className="container mx-auto px-4 relative">
          <div className="flex flex-col items-center text-center py-20 md:py-28 max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 border-2 border-foreground bg-primary px-4 py-1.5 text-sm font-mono font-bold uppercase tracking-wide text-primary-foreground shadow-brutal-sm mb-6">
              <Sparkles className="h-4 w-4" />
              Toda la variedad, un solo lugar
            </span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase">
              Todo y mas
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mt-4 max-w-2xl font-mono">
              Pesca, tecnologia, hogar, belleza, camping, seguridad y mucho mas.
              Todo lo que buscas en un solo lugar, con envios a todo el pais.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Link href="/catalogo">
                <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground border-2 border-foreground rounded-none px-8 py-3 font-mono font-bold uppercase tracking-wide shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                  Ver catalogo
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
              <Link href="/catalogo?destacados=true">
                <button className="inline-flex items-center gap-2 bg-background border-2 border-foreground rounded-none px-8 py-3 font-mono font-bold uppercase tracking-wide shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                  Destacados
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features bar */}
      <section className="border-b-2 border-foreground bg-foreground text-background">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Truck, title: 'Envios a todo el pais', desc: 'Entregas rapidas' },
              { icon: Store, title: 'Retiro en local', desc: 'Sin costo adicional' },
              { icon: ShieldCheck, title: 'Compra segura', desc: 'Pago protegido' },
              { icon: Headphones, title: 'Atencion personalizada', desc: 'Lun a Sab' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center border-2 border-background bg-primary text-primary-foreground">
                  <f.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold font-mono uppercase">{f.title}</p>
                  <p className="text-xs text-background/60 font-mono">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Explora por categorias</h2>
          <Link href="/catalogo" className="text-sm font-mono font-bold uppercase text-primary-foreground bg-foreground px-3 py-1.5 border-2 border-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
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
                className="group flex flex-col items-center gap-2 p-4 border-2 border-foreground bg-card shadow-brutal-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                <div className="flex h-14 w-14 items-center justify-center border-2 border-foreground bg-secondary text-foreground group-hover:bg-primary transition-colors">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-xs font-mono font-bold text-center uppercase">{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured products */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Productos destacados</h2>
          <Link href="/catalogo?destacados=true" className="text-sm font-mono font-bold uppercase text-primary-foreground bg-foreground px-3 py-1.5 border-2 border-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
            Ver mas
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] border-2 border-foreground bg-muted animate-pulse" />
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
        <div className="relative overflow-hidden border-2 border-foreground bg-primary p-8 md:p-12 text-center shadow-brutal-lg">
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-primary-foreground">
              Buscas algo especifico?
            </h2>
            <p className="text-primary-foreground/80 mt-2 max-w-xl mx-auto font-mono">
              Explora nuestro catalogo completo con una gran variedad de productos y rubros.
            </p>
            <Link href="/catalogo">
              <button className="mt-6 inline-flex items-center gap-2 bg-foreground text-background border-2 border-foreground rounded-none px-6 py-3 font-mono font-bold uppercase tracking-wide hover:bg-background hover:text-foreground transition-colors">
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
