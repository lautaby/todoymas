-- Dispositivos donde la dueña activó los avisos de compras (notificaciones web push).
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  user_id uuid,
  created_at timestamptz DEFAULT now()
);

-- RLS activado y SIN políticas: solo el servidor (service role) puede leer/escribir.
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Evita avisos duplicados por pedido (por si no se había corrido antes).
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notified_at timestamptz;
