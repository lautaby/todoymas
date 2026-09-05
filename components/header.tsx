'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, Search, ShoppingCart, X, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useCart } from '@/lib/cart-context';
import { CartDrawer } from './cart-drawer';
import { CategoryMenu } from './category-menu';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount, isCartOpen, setCartOpen } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/catalogo?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileOpen(false);
    }
  };

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-300',
          scrolled
            ? 'bg-background/95 backdrop-blur-md shadow-soft'
            : 'bg-background'
        )}
      >
        {/* Top bar */}
        <div className="bg-primary text-primary-foreground text-xs">
          <div className="container mx-auto px-4 flex items-center justify-center h-8 gap-1.5">
            <Leaf className="h-3 w-3 shrink-0" />
            <span className="hidden sm:block">Envíos a todo el país · Retiro en local disponible</span>
            <span className="sm:hidden">Envíos a todo el país</span>
          </div>
        </div>

        {/* Main header */}
        <div className="container mx-auto px-4 border-b border-border">
          <div className="flex items-center gap-4 h-16">
            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden rounded-full">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <SheetHeader className="p-4 border-b border-border">
                  <SheetTitle className="flex items-center gap-2 font-display">
                    <Leaf className="h-5 w-5 text-primary" />
                    Todo y mas
                  </SheetTitle>
                </SheetHeader>
                <div className="p-4 space-y-4">
                  <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar productos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </form>
                  <CategoryMenu onNavigate={() => setMobileOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Leaf className="h-5 w-5" />
              </div>
              <div className="hidden sm:block">
                <span className="text-lg font-display font-semibold tracking-tight leading-none">Todo y mas</span>
                <p className="text-[11px] text-muted-foreground mt-0.5">Tienda online</p>
              </div>
            </Link>

            {/* Desktop search */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Input
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary/50 border-transparent focus-visible:bg-background"
              />
            </form>

            {/* Cart */}
            <Button
              variant="default"
              size="icon"
              className="relative shrink-0"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-bold px-1 ring-2 ring-background">
                  {itemCount}
                </span>
              )}
            </Button>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 h-12">
            <Link href="/">
              <Button variant="ghost" size="sm" className={cn(pathname === '/' && 'bg-secondary')}>
                Inicio
              </Button>
            </Link>
            <Link href="/catalogo">
              <Button variant="ghost" size="sm" className={cn(pathname.startsWith('/catalogo') && 'bg-secondary')}>
                Todos los productos
              </Button>
            </Link>
            <CategoryMenu />
          </nav>
        </div>
      </header>

      <CartDrawer open={isCartOpen} onOpenChange={setCartOpen} />
    </>
  );
}
