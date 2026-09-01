'use client';

import Link from 'next/link';
import { ShoppingCart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/lib/cart-context';
import { formatPrice } from '@/lib/format';
import type { Product } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const outOfStock = product.stock <= 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300 hover:shadow-lg hover:border-primary/30">
      <Link href={`/producto/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
              Sin imagen
            </div>
          )}
          {product.featured && (
            <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
              Destacado
            </Badge>
          )}
          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Badge variant="destructive">Sin stock</Badge>
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span className="bg-white/90 backdrop-blur rounded-full p-2.5 shadow-lg">
              <Eye className="h-4 w-4" />
            </span>
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-3">
        <Link href={`/producto/${product.id}`}>
          <h3 className="text-sm font-medium line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-1 flex-1">
          {product.description}
        </p>
        <div className="flex items-center justify-between gap-2 mt-3">
          <div>
            <p className="text-lg font-bold text-primary">{formatPrice(product.price)}</p>
            <p className={cn('text-xs', outOfStock ? 'text-destructive' : 'text-success')}>
              {outOfStock ? 'Sin stock' : `${product.stock} disponibles`}
            </p>
          </div>
          <Button
            size="icon"
            className="h-9 w-9 shrink-0"
            disabled={outOfStock}
            onClick={(e) => {
              e.preventDefault();
              addItem(product, 1);
            }}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
