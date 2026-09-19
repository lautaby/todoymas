/*
# Variantes de producto (color, aroma, etc.)

1. New Tables
- `product_variants`: opciones de un mismo producto (ej: colores de un
  labial, aromas de un sahumerio, talles de una prenda).
  - id (uuid, PK)
  - product_id (FK → products.id, on delete cascade)
  - group_name (text): nombre del grupo de variante, ej "Color", "Aroma", "Talle"
  - label (text): valor puntual, ej "Rojo cereza", "Lavanda", "M"
  - color_hex (text, nullable): color hexadecimal para mostrar un swatch
    cuando la variante es un color (ej maquillaje). Si es null se muestra
    como un botón de texto (ej aromas, talles).
  - stock (int): stock propio de esa variante
  - sort_order (int): orden de aparición
  - created_at

2. Changes to existing tables
- `products.has_variants` (boolean, default false): se mantiene
  automáticamente vía trigger cada vez que se agrega/edita/quita una
  variante, para poder filtrar/mostrar distinto en las tarjetas de
  producto sin tener que consultar la tabla de variantes cada vez.

3. Security (RLS)
- product_variants: SELECT para anon+authenticated (igual que products);
  INSERT/UPDATE/DELETE solo para admin (misma función is_admin() ya
  existente en el proyecto).

4. Notes
- Si un producto no tiene filas en product_variants, se vende como hasta
  ahora (sin selector de variante).
- El stock de la variante es informativo/para mostrar disponibilidad en
  la tienda; el descuento de stock sigue siendo manual desde el panel,
  igual que con productos sin variantes.
*/

CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  group_name text NOT NULL DEFAULT 'Variante',
  label text NOT NULL,
  color_hex text,
  stock int NOT NULL DEFAULT 0,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ADD COLUMN IF NOT EXISTS has_variants boolean NOT NULL DEFAULT false;

ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_product_variants" ON product_variants;
CREATE POLICY "anon_select_product_variants" ON product_variants FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_product_variants" ON product_variants;
CREATE POLICY "admin_insert_product_variants" ON product_variants FOR INSERT
  TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_product_variants" ON product_variants;
CREATE POLICY "admin_update_product_variants" ON product_variants FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_product_variants" ON product_variants;
CREATE POLICY "admin_delete_product_variants" ON product_variants FOR DELETE
  TO authenticated USING (is_admin());

CREATE OR REPLACE FUNCTION public.sync_product_has_variants()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_id uuid;
BEGIN
  target_id := COALESCE(NEW.product_id, OLD.product_id);
  UPDATE products
    SET has_variants = EXISTS (SELECT 1 FROM product_variants WHERE product_id = target_id)
    WHERE id = target_id;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_has_variants_ins ON product_variants;
CREATE TRIGGER trg_sync_has_variants_ins AFTER INSERT ON product_variants
  FOR EACH ROW EXECUTE FUNCTION public.sync_product_has_variants();

DROP TRIGGER IF EXISTS trg_sync_has_variants_upd ON product_variants;
CREATE TRIGGER trg_sync_has_variants_upd AFTER UPDATE ON product_variants
  FOR EACH ROW EXECUTE FUNCTION public.sync_product_has_variants();

DROP TRIGGER IF EXISTS trg_sync_has_variants_del ON product_variants;
CREATE TRIGGER trg_sync_has_variants_del AFTER DELETE ON product_variants
  FOR EACH ROW EXECUTE FUNCTION public.sync_product_has_variants();

CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);
