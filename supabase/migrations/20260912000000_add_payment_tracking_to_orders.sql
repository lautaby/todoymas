/*
  # Payment tracking for orders

  1. Changes to `orders`
    - Add `payment_status` (text, default 'pendiente'): tracks payment state
      independently from fulfillment `status`. Expected values:
      'pendiente' | 'aprobado' | 'rechazado' | 'en_proceso'.
    - Add `mp_preference_id` (text, nullable): Mercado Pago Checkout Pro
      preference id created for this order, when payment_method = 'mercadopago'.
    - Add `mp_payment_id` (text, nullable): Mercado Pago payment id once the
      webhook confirms a payment for this order.

  2. Notes
    - These columns are updated by the Mercado Pago webhook using the
      Supabase service role key, which bypasses RLS. No new RLS policy is
      required for that path.
    - `payment_method` already existed (added in a previous migration) and
      now also accepts the value 'mercadopago' in addition to
      'efectivo' | 'tarjeta' | 'transferencia' | 'otro'.
*/

ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pendiente';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS mp_preference_id text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS mp_payment_id text;

CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_mp_preference ON orders(mp_preference_id);
