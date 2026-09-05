/*
# Demo seed: categories with icons + 3 example products per category

1. What this does
- Creates 8 top-level categories (if they don't already exist by slug), each with
  a `icon` value that matches a lucide-react icon already wired up in the
  storefront (see iconMap in components/category-menu.tsx and app/page.tsx):
  Fish, Cpu, Home, Flower2, Shirt, Sparkles, Tent, Camera.
- Backfills the `icon` column for any of these categories that already exist in
  your database but don't have an icon set yet (icon IS NULL), so this is safe
  to run even if you already created "Pesca", "Hogar", etc. by hand.
- Inserts 3 example products per category (24 total) with a description, price,
  stock and a real stock-photo URL in `images`, so the storefront has content
  to show immediately. One product per category is marked `featured = true`.

2. Safe to re-run
- Categories are only inserted if a category with the same slug doesn't already
  exist.
- Products are only inserted if a product with the same name doesn't already
  exist, so running this migration twice will not create duplicates.

3. Notes
- Prices are in ARS and are placeholder example values — adjust freely from
  the admin panel (/admin/productos).
- Product photos are free-to-use stock photos from Pexels, meant as
  placeholders. Replace them with real product photos anytime using the
  image uploader in the admin panel.
*/

-- 1. Categories -------------------------------------------------------------

INSERT INTO categories (name, slug, icon)
SELECT v.name, v.slug, v.icon
FROM (VALUES
  ('Pesca', 'pesca', 'Fish'),
  ('Tecnologia', 'tecnologia', 'Cpu'),
  ('Hogar', 'hogar', 'Home'),
  ('Belleza', 'belleza', 'Flower2'),
  ('Indumentaria', 'indumentaria', 'Shirt'),
  ('Bazar y Regalos', 'bazar-y-regalos', 'Sparkles'),
  ('Camping y Aire Libre', 'camping-y-aire-libre', 'Tent'),
  ('Fotografia y Electronica', 'fotografia-y-electronica', 'Camera')
) AS v(name, slug, icon)
WHERE NOT EXISTS (
  SELECT 1 FROM categories c WHERE c.slug = v.slug
);

-- Backfill icon on categories that already existed without one
UPDATE categories SET icon = 'Fish' WHERE slug = 'pesca' AND icon IS NULL;
UPDATE categories SET icon = 'Cpu' WHERE slug = 'tecnologia' AND icon IS NULL;
UPDATE categories SET icon = 'Home' WHERE slug = 'hogar' AND icon IS NULL;
UPDATE categories SET icon = 'Flower2' WHERE slug = 'belleza' AND icon IS NULL;
UPDATE categories SET icon = 'Shirt' WHERE slug = 'indumentaria' AND icon IS NULL;
UPDATE categories SET icon = 'Sparkles' WHERE slug = 'bazar-y-regalos' AND icon IS NULL;
UPDATE categories SET icon = 'Tent' WHERE slug = 'camping-y-aire-libre' AND icon IS NULL;
UPDATE categories SET icon = 'Camera' WHERE slug = 'fotografia-y-electronica' AND icon IS NULL;

-- 2. Example products ---------------------------------------------------------

INSERT INTO products (name, description, price, stock, category_id, images, featured)
SELECT v.name, v.description, v.price, v.stock, c.id, ARRAY[v.image], v.featured
FROM (VALUES
  -- Pesca
  ('Caña de pescar telescópica 2.4m',
   'Caña de pescar telescópica de fibra de carbono, liviana y resistente. Se pliega hasta los 45 cm para guardar o transportar con facilidad. Ideal para pesca de costa y de río.',
   45000, 15, 'pesca', 'https://images.pexels.com/photos/13615160/pexels-photo-13615160.jpeg?auto=compress&cs=tinysrgb&w=800', false),
  ('Reel de pesca spinning frontal',
   'Reel spinning con sistema de frenado suave y bobina de aluminio. Perfecto para principiantes y pescadores experimentados que buscan precisión en cada lance.',
   38000, 20, 'pesca', 'https://images.pexels.com/photos/3098597/pexels-photo-3098597.jpeg?auto=compress&cs=tinysrgb&w=800', false),
  ('Kit de señuelos y anzuelos x25',
   'Set completo con señuelos de distintos colores, anzuelos y accesorios básicos. Viene en una caja organizadora resistente al agua, lista para llevar a cualquier salida de pesca.',
   12000, 40, 'pesca', 'https://images.pexels.com/photos/2542/fishing-fishing-tackle-fisherman-bait.jpg?auto=compress&cs=tinysrgb&w=800', false),

  -- Tecnologia
  ('Auriculares inalámbricos Bluetooth',
   'Auriculares Bluetooth con cancelación de ruido pasiva y hasta 20 horas de batería. Conexión estable, sonido equilibrado y estuche de carga incluido.',
   42000, 35, 'tecnologia', 'https://images.pexels.com/photos/610945/pexels-photo-610945.jpeg?auto=compress&cs=tinysrgb&w=800', true),
  ('Notebook 14 pulgadas Core i3 128GB SSD',
   'Notebook liviana ideal para trabajo y estudio, con procesador Core i3, 8GB de RAM y almacenamiento SSD para arranques rápidos. Pantalla Full HD de 14 pulgadas.',
   780000, 6, 'tecnologia', 'https://images.pexels.com/photos/11857024/pexels-photo-11857024.jpeg?auto=compress&cs=tinysrgb&w=800', false),
  ('Mouse inalámbrico ergonómico',
   'Mouse inalámbrico con diseño ergonómico y sensor óptico de alta precisión. Conexión USB plug and play, compatible con Windows y Mac.',
   15000, 60, 'tecnologia', 'https://images.pexels.com/photos/7151702/pexels-photo-7151702.jpeg?auto=compress&cs=tinysrgb&w=800', false),

  -- Hogar
  ('Set de sábanas 2 plazas 400 hilos',
   'Juego de sábanas de algodón 400 hilos para cama de 2 plazas. Suaves, transpirables y de secado rápido, incluye funda de almohada.',
   32000, 25, 'hogar', 'https://images.pexels.com/photos/1034584/pexels-photo-1034584.jpeg?auto=compress&cs=tinysrgb&w=800', false),
  ('Juego de ollas antiadherentes x5 piezas',
   'Set de 5 ollas con revestimiento antiadherente, aptas para todo tipo de cocinas incluida inducción. Mangos ergonómicos que se mantienen fríos al tacto.',
   95000, 12, 'hogar', 'https://images.pexels.com/photos/5782042/pexels-photo-5782042.jpeg?auto=compress&cs=tinysrgb&w=800', true),
  ('Lámpara de mesa LED táctil regulable',
   'Lámpara de mesa LED con panel táctil e intensidad regulable en 3 niveles. Diseño minimalista, ideal para el living o la mesa de luz.',
   28000, 40, 'hogar', 'https://images.pexels.com/photos/7851906/pexels-photo-7851906.jpeg?auto=compress&cs=tinysrgb&w=800', false),

  -- Belleza
  ('Crema hidratante facial ácido hialurónico',
   'Crema hidratante de uso diario con ácido hialurónico, para todo tipo de piel. Textura liviana que se absorbe rápido y deja la piel suave sin sensación grasa.',
   19500, 45, 'belleza', 'https://images.pexels.com/photos/13794471/pexels-photo-13794471.jpeg?auto=compress&cs=tinysrgb&w=800', false),
  ('Set de brochas de maquillaje profesional x12',
   'Kit de 12 brochas de distintos tamaños para rostro y ojos, con cerdas suaves sintéticas. Incluye estuche organizador para guardarlas ordenadas.',
   24000, 30, 'belleza', 'https://images.pexels.com/photos/5553/makeup-brushes.jpg?auto=compress&cs=tinysrgb&w=800', false),
  ('Kit de cosméticos maquillaje completo',
   'Set con paleta de sombras, labial y base, pensado para lucir un maquillaje completo en cualquier ocasión. Colores versátiles para uso diario o de noche.',
   36000, 20, 'belleza', 'https://images.pexels.com/photos/3018845/pexels-photo-3018845.jpeg?auto=compress&cs=tinysrgb&w=800', true),

  -- Indumentaria
  ('Remera básica de algodón (pack x3)',
   'Pack de 3 remeras de algodón peinado, cuello redondo y corte clásico unisex. Ideales para el uso diario, disponibles en talles del S al XL.',
   21000, 60, 'indumentaria', 'https://images.pexels.com/photos/4440567/pexels-photo-4440567.jpeg?auto=compress&cs=tinysrgb&w=800', false),
  ('Buzo canguro unisex frisado',
   'Buzo canguro con interior frisado, bolsillo delantero y capucha ajustable. Abrigado y cómodo para los días de frío.',
   29500, 50, 'indumentaria', 'https://images.pexels.com/photos/4440576/pexels-photo-4440576.jpeg?auto=compress&cs=tinysrgb&w=800', false),
  ('Zapatillas urbanas unisex',
   'Zapatillas urbanas de suela flexible y plantilla acolchada, pensadas para el uso diario. Diseño versátil que combina con cualquier look.',
   58000, 25, 'indumentaria', 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800', true),

  -- Bazar y Regalos
  ('Taza térmica acero inoxidable 350ml',
   'Taza térmica de acero inoxidable que mantiene la temperatura de tus bebidas por horas. Tapa hermética antiderrame, ideal para llevar al trabajo o de viaje.',
   14500, 70, 'bazar-y-regalos', 'https://images.pexels.com/photos/805536/pexels-photo-805536.jpeg?auto=compress&cs=tinysrgb&w=800', false),
  ('Vela aromática de soja lavanda',
   'Vela artesanal de cera de soja con aroma a lavanda, en frasco de vidrio reutilizable. Combustión limpia y hasta 30 horas de duración.',
   9800, 55, 'bazar-y-regalos', 'https://images.pexels.com/photos/7704461/pexels-photo-7704461.jpeg?auto=compress&cs=tinysrgb&w=800', false),
  ('Set de mate con bombilla de acero inoxidable',
   'Mate de calabaza forrado en cuero con bombilla de acero inoxidable incluida. Un clásico infaltable para compartir en cualquier reunión.',
   26000, 35, 'bazar-y-regalos', 'https://images.pexels.com/photos/25436250/pexels-photo-25436250.jpeg?auto=compress&cs=tinysrgb&w=800', true),

  -- Camping y Aire Libre
  ('Carpa impermeable 4 personas doble techo',
   'Carpa para 4 personas con doble techo impermeable y armado sencillo tipo iglú. Ideal para camping, trekking o festivales.',
   145000, 10, 'camping-y-aire-libre', 'https://images.pexels.com/photos/6714/light-forest-trees-morning.jpg?auto=compress&cs=tinysrgb&w=800', true),
  ('Bolsa de dormir térmica -5°C',
   'Bolsa de dormir con relleno térmico para temperaturas de hasta -5°C. Liviana, compacta y con funda de transporte incluida.',
   68000, 18, 'camping-y-aire-libre', 'https://images.pexels.com/photos/15782410/pexels-photo-15782410.jpeg?auto=compress&cs=tinysrgb&w=800', false),
  ('Reposera plegable con apoyabrazos y portavaso',
   'Reposera plegable con apoyabrazos acolchados y portavaso integrado. Estructura resistente, fácil de transportar y guardar.',
   42000, 22, 'camping-y-aire-libre', 'https://images.pexels.com/photos/2398220/pexels-photo-2398220.jpeg?auto=compress&cs=tinysrgb&w=800', false),

  -- Fotografia y Electronica
  ('Cámara digital compacta 20MP zoom óptico',
   'Cámara digital compacta de 20 megapíxeles con zoom óptico 8x y grabación de video Full HD. Ideal para viajes y uso diario.',
   165000, 8, 'fotografia-y-electronica', 'https://images.pexels.com/photos/9943239/pexels-photo-9943239.jpeg?auto=compress&cs=tinysrgb&w=800', true),
  ('Trípode flexible para celular y cámara',
   'Trípode flexible con patas ajustables que se adaptan a cualquier superficie. Soporte universal compatible con celulares y cámaras compactas.',
   16500, 40, 'fotografia-y-electronica', 'https://images.pexels.com/photos/8359967/pexels-photo-8359967.jpeg?auto=compress&cs=tinysrgb&w=800', false),
  ('Power bank 10000mAh carga rápida',
   'Batería externa de 10000mAh con carga rápida y dos puertos USB. Suficiente para cargar tu celular varias veces sin necesidad de enchufe.',
   27500, 45, 'fotografia-y-electronica', 'https://images.pexels.com/photos/12879428/pexels-photo-12879428.jpeg?auto=compress&cs=tinysrgb&w=800', false)

) AS v(name, description, price, stock, category_slug, image, featured)
JOIN categories c ON c.slug = v.category_slug
WHERE NOT EXISTS (
  SELECT 1 FROM products p WHERE p.name = v.name
);
