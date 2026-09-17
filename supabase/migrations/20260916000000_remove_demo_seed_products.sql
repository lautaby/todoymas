/*
# Remove demo seed products

1. What this does
- Deletes the 24 example products inserted by
  20260905130000_seed_demo_categories_and_products.sql, matched by their exact
  name, so they no longer show up in the storefront.

2. What this does NOT do
- Does not touch the 8 demo categories (Pesca, Tecnología, Hogar, Belleza,
  Indumentaria, Bazar y Regalos, Camping y Aire Libre, Fotografía y
  Electrónica). Keep, rename or delete them from /admin/categorias depending
  on whether they fit the client's real catalog.
- Does not touch any product you already added for real through the admin
  panel - only the exact demo names below are removed.

3. Safe to re-run
- Uses a plain DELETE ... WHERE name IN (...), so running it twice is a no-op
  the second time.
*/

DELETE FROM products
WHERE name IN (
  'Caña de pescar telescópica 2.4m',
  'Reel de pesca spinning frontal',
  'Kit de señuelos y anzuelos x25',
  'Auriculares inalámbricos Bluetooth',
  'Notebook 14 pulgadas Core i3 128GB SSD',
  'Mouse inalámbrico ergonómico',
  'Set de sábanas 2 plazas 400 hilos',
  'Juego de ollas antiadherentes x5 piezas',
  'Lámpara de mesa LED táctil regulable',
  'Crema hidratante facial ácido hialurónico',
  'Set de brochas de maquillaje profesional x12',
  'Kit de cosméticos maquillaje completo',
  'Remera básica de algodón (pack x3)',
  'Buzo canguro unisex frisado',
  'Zapatillas urbanas unisex',
  'Taza térmica acero inoxidable 350ml',
  'Vela aromática de soja lavanda',
  'Set de mate con bombilla de acero inoxidable',
  'Carpa impermeable 4 personas doble techo',
  'Bolsa de dormir térmica -5°C',
  'Reposera plegable con apoyabrazos y portavaso',
  'Cámara digital compacta 20MP zoom óptico',
  'Trípode flexible para celular y cámara',
  'Power bank 10000mAh carga rápida'
);
