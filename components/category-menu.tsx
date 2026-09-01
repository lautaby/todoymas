'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ChevronDown, Fish, Cpu, Flower2, Home, Shirt, Sparkles, Tent, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { supabase, type Category } from '@/lib/supabase';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Fish, Cpu, Flower2, Home, Shirt, Sparkles, Tent, Camera,
};

export function CategoryMenu({ onNavigate }: { onNavigate?: () => void }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (data) setCategories(data as Category[]);
    }
    load();
  }, []);

  const parents = categories.filter(c => !c.parent_id);
  const childrenOf = (parentId: string) =>
    categories.filter(c => c.parent_id === parentId);

  if (onNavigate) {
    return (
      <div className="space-y-1">
        <Link href="/catalogo" onClick={onNavigate}>
          <Button variant="ghost" size="sm" className="w-full justify-start">
            Todos los productos
          </Button>
        </Link>
        {parents.map((parent) => {
          const Icon = parent.icon ? iconMap[parent.icon] : null;
          const subs = childrenOf(parent.id);
          return (
            <div key={parent.id} className="space-y-0.5">
              <div className="flex items-center gap-2 px-3 py-2 font-medium text-sm">
                {Icon && <Icon className="h-4 w-4 text-primary" />}
                {parent.name}
              </div>
              {subs.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/catalogo?subcategoria=${sub.slug}`}
                  onClick={onNavigate}
                >
                  <Button variant="ghost" size="sm" className="w-full justify-start pl-8 text-muted-foreground">
                    {sub.name}
                  </Button>
                </Link>
              ))}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <>
      {parents.map((parent) => {
        const Icon = parent.icon ? iconMap[parent.icon] : null;
        const subs = childrenOf(parent.id);
        return (
          <DropdownMenu key={parent.id}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1">
                {Icon && <Icon className="h-4 w-4" />}
                {parent.name}
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel className="font-semibold">
                {parent.name}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/catalogo?categoria=${parent.slug}`}>
                  Ver todo en {parent.name}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {subs.map((sub) => (
                <DropdownMenuItem key={sub.id} asChild>
                  <Link href={`/catalogo?subcategoria=${sub.slug}`}>
                    {sub.name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      })}
    </>
  );
}
