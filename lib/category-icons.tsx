import {
  Fish,
  Cpu,
  Home,
  Flower2,
  Shirt,
  Sparkles,
  Tent,
  Camera,
  Plug,
  Drill,
  Mountain,
  Wrench,
  Dog,
  PawPrint,
  Baby,
  BookOpen,
  Gamepad2,
  Utensils,
  Car,
  Dumbbell,
  Palette,
  Paintbrush,
  Gift,
  Flame,
  Droplet,
  Wine,
  Music,
  Watch,
  Glasses,
  Umbrella,
  Scissors,
  Package,
  Leaf,
  Baby as BabyIcon,
} from 'lucide-react';

export type CategoryIconOption = {
  value: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
};

// Catálogo compartido de íconos para categorías. Se usa en el menú de
// navegación, la portada y el panel de administración, así que agregar un
// ícono nuevo acá lo deja disponible en los tres lugares.
export const CATEGORY_ICON_OPTIONS: CategoryIconOption[] = [
  { value: 'Flower2', label: 'Belleza', Icon: Flower2 },
  { value: 'Home', label: 'Hogar / Bazar', Icon: Home },
  { value: 'Fish', label: 'Pesca', Icon: Fish },
  { value: 'Plug', label: 'Electro', Icon: Plug },
  { value: 'Drill', label: 'Herramientas', Icon: Drill },
  { value: 'Mountain', label: 'Camping / Outdoor', Icon: Mountain },
  { value: 'Tent', label: 'Camping (carpa)', Icon: Tent },
  { value: 'Cpu', label: 'Tecnología', Icon: Cpu },
  { value: 'Shirt', label: 'Indumentaria', Icon: Shirt },
  { value: 'Sparkles', label: 'Regalos / Novedades', Icon: Sparkles },
  { value: 'Camera', label: 'Fotografía', Icon: Camera },
  { value: 'Wrench', label: 'Ferretería', Icon: Wrench },
  { value: 'Flame', label: 'Sahumerios / Velas', Icon: Flame },
  { value: 'Droplet', label: 'Perfumería / Aromaterapia', Icon: Droplet },
  { value: 'Leaf', label: 'Naturales / Aromaterapia', Icon: Leaf },
  { value: 'Gift', label: 'Regalería', Icon: Gift },
  { value: 'Utensils', label: 'Cocina', Icon: Utensils },
  { value: 'Wine', label: 'Bebidas', Icon: Wine },
  { value: 'Dog', label: 'Mascotas', Icon: Dog },
  { value: 'PawPrint', label: 'Mascotas (huella)', Icon: PawPrint },
  { value: 'Baby', label: 'Bebés / Niños', Icon: BabyIcon },
  { value: 'BookOpen', label: 'Librería', Icon: BookOpen },
  { value: 'Gamepad2', label: 'Juguetes / Gaming', Icon: Gamepad2 },
  { value: 'Car', label: 'Accesorios de auto', Icon: Car },
  { value: 'Dumbbell', label: 'Deportes', Icon: Dumbbell },
  { value: 'Palette', label: 'Arte / Manualidades', Icon: Palette },
  { value: 'Paintbrush', label: 'Pintura', Icon: Paintbrush },
  { value: 'Music', label: 'Música', Icon: Music },
  { value: 'Watch', label: 'Relojería', Icon: Watch },
  { value: 'Glasses', label: 'Óptica', Icon: Glasses },
  { value: 'Umbrella', label: 'Lluvia / Aire libre', Icon: Umbrella },
  { value: 'Scissors', label: 'Peluquería', Icon: Scissors },
  { value: 'Package', label: 'Varios', Icon: Package },
];

export const CATEGORY_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> =
  Object.fromEntries(CATEGORY_ICON_OPTIONS.map((opt) => [opt.value, opt.Icon]));

// Paleta de fondos pastel para chips/círculos de categoría (portada y
// tarjetas de producto), inspirada en la identidad de marca. Se elige de
// forma determinística según el id de categoría, así una misma categoría
// siempre tiene el mismo color en todo el sitio.
export const CATEGORY_TINTS: { bg: string; fg: string }[] = [
  { bg: '#F3DEE3', fg: '#8A4A5A' }, // rosa (belleza)
  { bg: '#F3E6D0', fg: '#8A6A3A' }, // arena (hogar/bazar)
  { bg: '#DCEAF0', fg: '#3A6A80' }, // celeste (pesca)
  { bg: '#E7E1F3', fg: '#5A4A8A' }, // lila (electro)
  { bg: '#F6E3C0', fg: '#8A5A1A' }, // mostaza (herramientas)
  { bg: '#DCE9D8', fg: '#2E5D46' }, // salvia (camping/outdoor)
  { bg: '#F0DCD4', fg: '#8A4A2E' }, // terracota
  { bg: '#E0E5DC', fg: '#4A5A44' }, // gris verdoso
];

export function tintForCategory(id: string | null | undefined) {
  if (!id) return CATEGORY_TINTS[CATEGORY_TINTS.length - 1];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return CATEGORY_TINTS[hash % CATEGORY_TINTS.length];
}
