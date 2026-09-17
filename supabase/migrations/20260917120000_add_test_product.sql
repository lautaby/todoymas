/*
# Add test product for checkout testing

1. What this does
- Inserts a featured test product ("Producto de Prueba (Test Checkout)") into the
  products table so you can immediately test the entire purchasing circuit
  (adding to cart, checkout form, shipping selection, and payment gateways).

2. Safe to re-run
- Uses NOT EXISTS so running it multiple times won't create duplicate products.
*/

INSERT INTO products (name, description, price, stock, category_id, images, featured)
SELECT 
  'Producto de Prueba (Test Checkout)',
  'Artículo de prueba para testear el circuito completo de compra, pasarelas de pago (Mercado Pago / GoCuotas) y envío en la tienda "Todo y Más".',
  1500.00,
  100,
  c.id,
  ARRAY['https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg'],
  true
FROM categories c
WHERE c.slug = 'tecnologia'
  AND NOT EXISTS (
    SELECT 1 FROM products p WHERE p.name = 'Producto de Prueba (Test Checkout)'
  );
