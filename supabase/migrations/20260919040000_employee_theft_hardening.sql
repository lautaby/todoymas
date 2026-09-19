/*
# Employee theft hardening

Cierra 3 agujeros que un empleado (no admin) podía usar para robar mercadería
o plata, aprovechando que las políticas RLS solo distinguen "logueado" vs
"no logueado" y no "admin" vs "empleado" en varios lugares:

1. `orders.created_by`: ninguna venta quedaba asociada a qué usuario la
   registró. Sin esto, si faltaba mercadería o plata de una venta de
   mostrador, no había forma de saber quién la hizo. Ahora
   `register_counter_sale` graba automáticamente `auth.uid()`.

2. Descuento sin límite en `register_counter_sale`: el front-end solo
   evitaba que el descuento superara el subtotal, pero un empleado podía
   llamar la función directamente (o editar el descuento en el navegador)
   y aplicar un 100% de descuento, "vendiendo" mercadería gratis a un
   cómplice mientras el stock queda registrado como vendido normalmente.
   Ahora un no-admin tiene un tope de 15% del subtotal; el dueño (admin)
   no tiene tope.

3. `payment_status`, `mp_preference_id` y `mp_payment_id` en `orders` no
   estaban protegidos por el trigger anti-empleado (solo se protegían
   total/items/datos del cliente/canal/método de pago). Estos campos los
   debería tocar únicamente el webhook de Mercado Pago (service role) o el
   dueño. Sin esta protección, un empleado podía marcar a mano un pedido
   online como "aprobado" y entregarlo sin que el pago hubiera llegado
   nunca.

Todo esto es además de lo que ya restringía
20260918010000_restrict_employee_permissions.sql (categorías, productos,
borrado de pedidos, y que nadie pueda cambiarse su propio rol).
*/

-- 1. Trazabilidad: quién registró cada pedido/venta.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES profiles(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_orders_created_by ON orders(created_by);

-- 2. register_counter_sale: graba quién vendió y limita el descuento libre
--    de los empleados (el dueño no tiene tope).
CREATE OR REPLACE FUNCTION register_counter_sale(
  p_items jsonb,
  p_payment_method text DEFAULT 'efectivo',
  p_customer_name text DEFAULT NULL,
  p_notes text DEFAULT NULL,
  p_discount numeric DEFAULT 0
)
RETURNS orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order orders;
  v_subtotal numeric(10,2) := 0;
  v_total numeric(10,2) := 0;
  v_item jsonb;
  v_product products%ROWTYPE;
  v_qty int;
  v_final_items jsonb := '[]'::jsonb;
  v_discount numeric(10,2) := GREATEST(COALESCE(p_discount, 0), 0);
  v_max_discount numeric(10,2);
BEGIN
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'La venta no tiene productos';
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_qty := COALESCE((v_item->>'quantity')::int, 0);

    IF v_qty <= 0 THEN
      RAISE EXCEPTION 'Cantidad inválida para un producto';
    END IF;

    SELECT * INTO v_product
    FROM products
    WHERE id = (v_item->>'product_id')::uuid
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Uno de los productos ya no existe';
    END IF;

    IF v_product.stock < v_qty THEN
      RAISE EXCEPTION 'Stock insuficiente para "%": quedan % unidades', v_product.name, v_product.stock;
    END IF;

    UPDATE products SET stock = stock - v_qty WHERE id = v_product.id;

    v_subtotal := v_subtotal + (v_product.price * v_qty);
    v_final_items := v_final_items || jsonb_build_object(
      'product_id', v_product.id,
      'name', v_product.name,
      'price', v_product.price,
      'quantity', v_qty,
      'image', COALESCE(v_product.images[1], '')
    );
  END LOOP;

  IF NOT is_admin() THEN
    v_max_discount := round(v_subtotal * 0.15, 2);
    IF v_discount > v_max_discount THEN
      RAISE EXCEPTION 'Los empleados pueden descontar como máximo 15%% del total ($%). Para un descuento mayor pedile al dueño que lo cargue.', v_max_discount;
    END IF;
  END IF;

  v_total := GREATEST(v_subtotal - v_discount, 0);

  INSERT INTO orders (
    customer_name, status, shipping_method, channel, payment_method, notes, total, items, created_by
  ) VALUES (
    COALESCE(NULLIF(TRIM(p_customer_name), ''), 'Cliente de mostrador'),
    'entregado',
    'retiro',
    'mostrador',
    COALESCE(p_payment_method, 'efectivo'),
    p_notes,
    v_total,
    v_final_items,
    auth.uid()
  )
  RETURNING * INTO v_order;

  RETURN v_order;
END;
$$;

REVOKE ALL ON FUNCTION register_counter_sale(jsonb, text, text, text, numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION register_counter_sale(jsonb, text, text, text, numeric) TO authenticated;

-- 3. El trigger anti-empleado ahora también protege los campos de pago:
--    solo el webhook de Mercado Pago (service_role) o el dueño pueden
--    tocarlos.
CREATE OR REPLACE FUNCTION public.enforce_employee_order_restrictions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF is_admin() THEN
    RETURN NEW;
  END IF;

  IF NEW.total IS DISTINCT FROM OLD.total
     OR NEW.items IS DISTINCT FROM OLD.items
     OR NEW.customer_name IS DISTINCT FROM OLD.customer_name
     OR NEW.customer_email IS DISTINCT FROM OLD.customer_email
     OR NEW.customer_phone IS DISTINCT FROM OLD.customer_phone
     OR NEW.channel IS DISTINCT FROM OLD.channel
     OR NEW.payment_method IS DISTINCT FROM OLD.payment_method
     OR NEW.payment_status IS DISTINCT FROM OLD.payment_status
     OR NEW.mp_preference_id IS DISTINCT FROM OLD.mp_preference_id
     OR NEW.mp_payment_id IS DISTINCT FROM OLD.mp_payment_id
     OR NEW.created_by IS DISTINCT FROM OLD.created_by
  THEN
    RAISE EXCEPTION 'No tenés permiso para modificar ese dato del pedido';
  END IF;

  RETURN NEW;
END;
$$;
-- (el trigger que usa esta función ya existe desde la migración anterior;
-- CREATE OR REPLACE FUNCTION alcanza, no hace falta recrearlo)
