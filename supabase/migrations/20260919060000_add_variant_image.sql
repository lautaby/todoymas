/*
# Foto propia por variante

1. Changes
- `product_variants.image_url` (text, nullable): foto específica de esa
  variante (ej: la foto del labial en el tono "Rojo cereza"). Si es null,
  la ficha del producto sigue mostrando las fotos generales del producto.
*/

ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS image_url text;
