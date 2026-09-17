// Crea el usuario admin real del cliente en Supabase Auth y le da rol 'admin'
// en la tabla `profiles`, para que pueda entrar a /admin con usuario y
// contraseña (no con email - ver ADMIN_LOGIN_DOMAIN abajo).
//
// Uso:
//   1. npm install (si todavía no lo hiciste; usa @supabase/supabase-js, ya
//      está en las dependencias del proyecto).
//   2. Definí estas variables de entorno (nunca las subas a git):
//        SUPABASE_URL=https://tu-proyecto.supabase.co
//        SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key   (la secreta, no la anon)
//        ADMIN_USERNAME=el-usuario-que-va-a-escribir-el-cliente
//        ADMIN_PASSWORD=una-contraseña-segura
//   3. Corré:
//        node scripts/create-admin-user.mjs
//
// El cliente después entra a /admin escribiendo exactamente ADMIN_USERNAME
// (sin @ ni dominio) y su contraseña.
//
// El script es seguro de re-ejecutar: si el usuario ya existe, solo se
// asegura de que su fila en `profiles` tenga role = 'admin'.

import { createClient } from '@supabase/supabase-js';

// Debe coincidir EXACTO con ADMIN_LOGIN_DOMAIN en lib/auth-context.tsx.
const ADMIN_LOGIN_DOMAIN = 'panel.todoymas.local';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !ADMIN_USERNAME || !ADMIN_PASSWORD) {
  console.error(
    'Faltan variables de entorno. Necesitás SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_USERNAME y ADMIN_PASSWORD.'
  );
  process.exit(1);
}

const ADMIN_EMAIL = `${ADMIN_USERNAME.trim()}@${ADMIN_LOGIN_DOMAIN}`;

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function main() {
  // 1. Buscar si el usuario ya existe (paginando por las dudas de que haya muchos).
  let existingUser = null;
  let page = 1;
  while (!existingUser) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    existingUser = data.users.find((u) => u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());
    if (existingUser || data.users.length < 200) break;
    page += 1;
  }

  let userId;

  if (existingUser) {
    userId = existingUser.id;
    console.log(`El usuario '${ADMIN_USERNAME}' ya existía (id: ${userId}). No se tocó su contraseña.`);
  } else {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
    });
    if (error) throw error;
    userId = data.user.id;
    console.log(`Usuario '${ADMIN_USERNAME}' creado (id: ${userId}).`);
  }

  // 2. Dar de alta / actualizar su fila en profiles con role = 'admin'.
  const { error: upsertError } = await supabaseAdmin
    .from('profiles')
    .upsert({ id: userId, email: ADMIN_EMAIL, role: 'admin' }, { onConflict: 'id' });

  if (upsertError) throw upsertError;

  console.log(`Listo: '${ADMIN_USERNAME}' tiene role = 'admin' en profiles. Ya puede entrar en /admin con ese usuario y su contraseña.`);
}

main().catch((err) => {
  console.error('Error creando el usuario admin:', err);
  process.exit(1);
});
