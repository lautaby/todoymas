/*
# Counter sales (ventas en mostrador)

1. Changes to `orders`
- Add `channel` (text, default 'online'): distinguishes online checkout orders from
  in-person counter sales ('mostrador'). Existing rows default to 'online'.
- Add `payment_method` (text, nullable): how a counter sale was paid
  ('efectivo' | 'tarjeta' | 'transferencia' | 'otro'). Not used by the online checkout.

2. New function `register_counter_sale`
- Registers an in-store sale in a single atomic transaction: locks each product row,
  validates there is enough stock, decrements stock, computes the total from the
  product's current price (not client-supplied prices) minus an optional discount,
  and inserts the resulting order with channel = 'mostrador' and status = 'entregado'.
- SECURITY DEFINER so the stock check/decrement + insert happen atomically regardless
  of the caller's row-level permissions; EXECUTE is restricted to authenticated users
  only (the admin panel), matching how the rest of the schema treats "authenticated"
  as staff.

3. Notes
- No changes to existing RLS policies; the public checkout flow is unaffected since it
  does not set `channel` or `payment_method` and simply gets the 'online' default.
*/

ALTER TABLE orders ADD COLUMN IF NOT EXISTS channel text NOT NULL DEFAULT 'online';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method text;

CREATE INDEX IF NOT EXISTS idx_orders_channel ON orders(channel);

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
  v_total numeric(10,2) := 0;
  v_item jsonb;
  v_product products%ROWTYPE;
  v_qty int;
  v_final_items jsonb := '[]'::jsonb;
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

    v_total := v_total + (v_product.price * v_qty);
    v_final_items := v_final_items || jsonb_build_object(
      'product_id', v_product.id,
      'name', v_product.name,
      'price', v_product.price,
      'quantity', v_qty,
      'image', COALESCE(v_product.images[1], '')
    );
  END LOOP;

  v_total := GREATEST(v_total - COALESCE(p_discount, 0), 0);

  INSERT INTO orders (
    customer_name, status, shipping_method, channel, payment_method, notes, total, items
  ) VALUES (
    COALESCE(NULLIF(TRIM(p_customer_name), ''), 'Cliente de mostrador'),
    'entregado',
    'retiro',
    'mostrador',
    COALESCE(p_payment_method, 'efectivo'),
    p_notes,
    v_total,
    v_final_items
  )
  RETURNING * INTO v_order;

  RETURN v_order;
END;
$$;

REVOKE ALL ON FUNCTION register_counter_sale(jsonb, text, text, text, numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION register_counter_sale(jsonb, text, text, text, numeric) TO authenticated;
