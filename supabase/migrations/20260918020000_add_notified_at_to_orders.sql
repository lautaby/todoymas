-- Evita avisos duplicados al celular: se marca cuándo se avisó cada pedido.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notified_at timestamptz;
