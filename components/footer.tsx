import Link from 'next/link';
import { Store, Mail, Phone, MapPin, Fish, Cpu, Flower2, Home, Shirt, Sparkles, Tent, Camera } from 'lucide-react';

const categories = [
  { name: 'Pesca', icon: Fish },
  { name: 'Tecnología', icon: Cpu },
  { name: 'Aromaterapia', icon: Flower2 },
  { name: 'Hogar', icon: Home },
  { name: 'Indumentaria', icon: Shirt },
  { name: 'Belleza', icon: Sparkles },
  { name: 'Camping', icon: Tent },
  { name: 'Seguridad', icon: Camera },
];

export function Footer() {
  return (
    <footer className="border-t bg-secondary/30 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Store className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold">De todo y mas</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Tu tienda de confianza con la mayor variedad de productos. Pesca, tecnología, hogar, belleza y mucho mas.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Categorias</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat.name}>
                  <Link href={`/catalogo?categoria=${cat.name.toLowerCase()}`} className="hover:text-primary transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Informacion</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/catalogo" className="hover:text-primary transition-colors">Catalogo completo</Link></li>
              <li><Link href="/carrito" className="hover:text-primary transition-colors">Carrito</Link></li>
              <li><Link href="/checkout" className="hover:text-primary transition-colors">Checkout</Link></li>
              <li><Link href="/admin" className="hover:text-primary transition-colors">Panel de administracion</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Contacto</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0" /> Av. Principal 1234, CABA</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0" /> (11) 5555-1234</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0" /> info@detodoymas.com</li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} De todo y mas - Todos los derechos reservados</p>
        </div>
      </div>
    </footer>
  );
}
