/*
  # Payment tracking for GoCuotas orders

  1. Changes to `orders`
    - Add `gocuotas_order_id` (text, nullable): the order_id that GoCuotas
      assigns to a checkout, received via their webhook. Mirrors how
      `mp_payment_id` works for Mercado Pago.

  2. Notes
    - `payment_method` already accepts free text values ('efectivo',
      'tarjeta', 'transferencia', 'mercadopago', 'otro') - this migration
      adds 'gocuotas' as another valid value used by the app, no schema
      change needed for that column itself.
    - Updated by the GoCuotas webhook using the Supabase service role key,
      same as the Mercado Pago webhook - no new RLS policy required.
*/

ALTER TABLE orders ADD COLUMN IF NOT EXISTS gocuotas_order_id text;

CREATE INDEX IF NOT EXISTS idx_orders_gocuotas_order ON orders(gocuotas_order_id);
