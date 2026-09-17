/*
  # Mercado Pago OAuth connection

  1. What this does
    - Creates `mercadopago_connection`, a single-row table that stores the
      access/refresh tokens Mercado Pago gives us after the store owner
      connects their own Mercado Pago account via OAuth (the "Conectar con
      Mercado Pago" button in /admin/pagos).
    - This replaces having to paste a Mercado Pago access token as an
      environment variable: the token here belongs to the seller (the
      client), obtained by them logging into their own Mercado Pago
      account, never typed or shared with the developer.

  2. Security
    - RLS is enabled with NO policies for anon/authenticated, so this table
      is completely invisible to the browser (both the storefront and the
      admin panel use the public anon key). Only server-side code using the
      Supabase service role key (never exposed to the browser) can read or
      write it - see lib/server/mercadopago-connection.ts.
    - `pending_state` / `pending_state_created_at` are used to protect the
      OAuth flow itself: only a request that was started by an authenticated
      admin (see app/api/mercadopago/oauth/start) produces a valid state, so
      a stranger can't hijack the connect flow and link their own Mercado
      Pago account to this store.
*/

CREATE TABLE IF NOT EXISTS mercadopago_connection (
  id boolean PRIMARY KEY DEFAULT true,
  access_token text,
  refresh_token text,
  public_key text,
  mp_user_id text,
  token_expires_at timestamptz,
  pending_state text,
  pending_state_created_at timestamptz,
  connected_at timestamptz,
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT mercadopago_connection_singleton CHECK (id = true)
);

ALTER TABLE mercadopago_connection ENABLE ROW LEVEL SECURITY;
-- Intentionally no policies: only the service role (which bypasses RLS)
-- can access this table.
