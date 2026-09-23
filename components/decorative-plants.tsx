// Ilustraciones decorativas de plantas/hojas, pensadas para usarse como
// acentos de fondo (absolute + overflow-hidden en el contenedor padre).
// Usan currentColor para heredar color vía clases de texto (text-primary,
// text-accent, etc.) y opacidad vía las utilidades de Tailwind (/10, /20...).

export function OrganicBlob({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 600" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M431.5 73.5C495 116 552 178 566 250.5c14 72.5-14 155.5-63.5 216.5C453 528 380 566 305 570.5c-75 4.5-153.5-24.5-207-79.5C44.5 436 16 355.5 21.5 278 27 200.5 66.5 126 128 82C189.5 38 273 24.5 344 33c71 8.5 24 -1.5 87.5 40.5Z"
      />
    </svg>
  );
}

export function LeafScatter({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 600" className={className} fill="none" aria-hidden="true">
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

// Ramita simple con un tallo y unas pocas hojas, pensada para acentos
// chicos en esquinas (headers de sección, footer, estados vacíos).
export function LeafSprig({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 320" className={className} fill="none" aria-hidden="true">
      <path
        d="M100 300C96 230 94 160 100 20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M100 250c-38-6-62-34-68-74 44 2 74 26 68 74Z"
        fill="currentColor"
        opacity="0.28"
      />
      <path
        d="M100 190c40-4 66-30 74-70-46 0-78 24-74 70Z"
        fill="currentColor"
        opacity="0.22"
      />
      <path
        d="M100 130c-32-6-52-28-58-62 38 2 62 22 58 62Z"
        fill="currentColor"
        opacity="0.3"
      />
      <path
        d="M100 70c26-6 42-22 48-48-32 2-52 18-48 48Z"
        fill="currentColor"
        opacity="0.25"
      />
    </svg>
  );
}

// Enredadera horizontal: tallo sinuoso con hojitas alternadas, pensada
// para correr a lo largo de un borde (top/bottom de una sección).
export function Vine({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 500 90" className={className} fill="none" aria-hidden="true">
      <path
        d="M0 45c40-30 80 30 120 0s80-30 120 0 80 30 120 0 80-30 140 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.45"
      />
      <path d="M55 40c-4-16 6-28 22-30-2 18-8 28-22 30Z" fill="currentColor" opacity="0.28" />
      <path d="M135 20c10-14 26-14 38-4-14 10-26 12-38 4Z" fill="currentColor" opacity="0.24" />
      <path d="M215 60c-6-16 2-30 18-34 0 18-4 30-18 34Z" fill="currentColor" opacity="0.3" />
      <path d="M295 20c10-14 26-14 38-4-14 10-26 12-38 4Z" fill="currentColor" opacity="0.24" />
      <path d="M375 60c-6-16 2-30 18-34 0 18-4 30-18 34Z" fill="currentColor" opacity="0.28" />
      <circle cx="450" cy="42" r="4" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

// Flor simple de cinco pétalos con centro, para sumar variedad de
// elementos naturales además de hojas (acentos chicos, poca opacidad).
export function Bloom({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <g fill="currentColor">
        <ellipse cx="50" cy="24" rx="13" ry="20" opacity="0.28" />
        <ellipse cx="50" cy="24" rx="13" ry="20" opacity="0.28" transform="rotate(72 50 50)" />
        <ellipse cx="50" cy="24" rx="13" ry="20" opacity="0.28" transform="rotate(144 50 50)" />
        <ellipse cx="50" cy="24" rx="13" ry="20" opacity="0.28" transform="rotate(216 50 50)" />
        <ellipse cx="50" cy="24" rx="13" ry="20" opacity="0.28" transform="rotate(288 50 50)" />
        <circle cx="50" cy="50" r="10" opacity="0.4" />
      </g>
    </svg>
  );
}

// Mandala ornamental, en línea con el logo de la marca. Pensada como
// textura de fondo (poca opacidad, currentColor) para secciones grandes:
// hero, franjas de categorías, footer. Se construye con varios anillos
// de pétalos repetidos por rotación.
export function Mandala({ className }: { className?: string }) {
  const petal = (r: number, w: number, h: number, opacity: number) => {
    const steps = 12;
    const items = [];
    for (let i = 0; i < steps; i++) {
      const angle = (360 / steps) * i;
      items.push(
        <ellipse
          key={`${r}-${i}`}
          cx="200"
          cy={200 - r}
          rx={w}
          ry={h}
          opacity={opacity}
          transform={`rotate(${angle} 200 200)`}
        />
      );
    }
    return items;
  };

  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1">
        <circle cx="200" cy="200" r="190" opacity="0.15" />
        <circle cx="200" cy="200" r="150" opacity="0.18" />
        <circle cx="200" cy="200" r="60" opacity="0.25" />
      </g>
      <g fill="currentColor">
        {petal(170, 10, 26, 0.16)}
        {petal(120, 14, 34, 0.2)}
        {petal(70, 12, 26, 0.26)}
        <circle cx="200" cy="200" r="16" opacity="0.32" />
      </g>
    </svg>
  );
}

// Isotipo de mandala/flor de loto para el logo (header, footer). A
// diferencia de <Mandala>, pensada como textura de fondo a baja opacidad,
// esta va a opacidad plena y tamaño chico, como el ícono de línea fina
// del manual de marca.
export function LogoMark({ className }: { className?: string }) {
  const petals = (r: number, w: number, h: number, count: number) => {
    const items = [];
    for (let i = 0; i < count; i++) {
      const angle = (360 / count) * i;
      items.push(
        <ellipse
          key={`${r}-${i}`}
          cx="50"
          cy={50 - r}
          rx={w}
          ry={h}
          transform={`rotate(${angle} 50 50)`}
        />
      );
    }
    return items;
  };

  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
      <circle cx="50" cy="50" r="47" strokeWidth="1" opacity="0.5" />
      <g>{petals(30, 4, 12, 8)}</g>
      <g>{petals(18, 5, 10, 8)}</g>
      <circle cx="50" cy="50" r="7" />
    </svg>
  );
}

// Ilustración de línea (montaña + sol + agua) para usar dentro de los
// "photo slots": el espacio reservado para la foto real de producto/estilo
// que todavía no tenemos, así ese bloque no se ve vacío mientras tanto.
export function SceneryPlaceholder({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 140" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="150" cy="35" r="14" opacity="0.6" />
      <path d="M10 110 L60 55 L90 85 L120 45 L190 110 Z" opacity="0.7" />
      <path d="M0 120 Q50 105 100 120 T200 120" opacity="0.5" />
    </svg>
  );
}
