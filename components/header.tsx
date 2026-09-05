'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, Search, ShoppingCart, X, Store } from 'lucide-react';
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
            ? 'bg-white/95 backdrop-blur-md shadow-md'
            : 'bg-white shadow-sm'
        )}
      >
        {/* Top bar */}
        <div className="bg-foreground text-background text-xs font-mono">
          <div className="container mx-auto px-4 flex items-center justify-center h-8 uppercase tracking-wider">
            <span className="hidden sm:block">Envios a todo el pais // Retiro en local disponible</span>
            <span className="sm:hidden">Envios a todo el pais</span>
          </div>
        </div>

        {/* Main header */}
        <div className="container mx-auto px-4 border-b-2 border-foreground">
          <div className="flex items-center gap-4 h-16">
            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0 border-r-2 border-foreground">
                <SheetHeader className="p-4 border-b-2 border-foreground">
                  <SheetTitle className="flex items-center gap-2 font-mono uppercase">
                    <Store className="h-5 w-5 text-primary" />
                    Todo y mas
                  </SheetTitle>
                </SheetHeader>
                <div className="p-4 space-y-4">
                  <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar productos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </form>
                  <CategoryMenu onNavigate={() => setMobileOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-none border-2 border-foreground bg-primary text-primary-foreground shadow-brutal-sm">
                <Store className="h-5 w-5" />
              </div>
              <div className="hidden sm:block">
                <span className="text-lg font-bold tracking-tight font-mono uppercase">Todo y mas</span>
                <p className="text-[10px] text-muted-foreground -mt-1 font-mono uppercase tracking-wider">Tienda online</p>
              </div>
            </Link>

            {/* Desktop search */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Input
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background border-foreground"
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
                <span className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-none border-2 border-foreground bg-foreground text-background text-xs font-bold px-1">
                  {itemCount}
                </span>
              )}
            </Button>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 h-11">
            <Link href="/">
              <Button variant="ghost" size="sm" className={cn('font-mono', pathname === '/' && 'bg-accent text-accent-foreground')}>
                Inicio
              </Button>
            </Link>
            <Link href="/catalogo">
              <Button variant="ghost" size="sm" className={cn('font-mono', pathname.startsWith('/catalogo') && 'bg-accent text-accent-foreground')}>
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
