/*
  # Mercado Pago OAuth pending states

  1. What this does
    - Creates `oauth_states`, used by lib/server/mercadopago-connection.ts
      (createPendingOauthState / consumePendingOauthState) to protect the
      "Conectar con Mercado Pago" flow: a random state is created when the
      admin clicks connect, and consumed (deleted) when Mercado Pago
      redirects back, so a stranger can't hijack the callback and link
      their own account.
    - This table was referenced in code since the OAuth connection feature
      was added but was missing from the migrations, so every attempt to
      start a Mercado Pago connection failed with
      "relation oauth_states does not exist".

  2. Security
    - RLS enabled with no policies: only the service role (server-side,
      never exposed to the browser) can read/write it.
*/

CREATE TABLE IF NOT EXISTS oauth_states (
  state text PRIMARY KEY,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE oauth_states ENABLE ROW LEVEL SECURITY;
-- Intentionally no policies: only the service role can access this table.
