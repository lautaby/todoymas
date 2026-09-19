import { getServiceSupabase } from './mercadopago-connection';

// Debe coincidir EXACTO con ADMIN_LOGIN_DOMAIN en lib/auth-context.tsx y en
// scripts/create-admin-user.mjs: así el empleado entra a /admin escribiendo
// solo su nombre de usuario, sin "@algo.com".
const LOGIN_DOMAIN = 'panel.todoymas.local';

export type StaffMember = {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'empleado';
  created_at: string;
};

function usernameToEmail(username: string) {
  return `${username.trim().toLowerCase()}@${LOGIN_DOMAIN}`;
}

function emailToUsername(email: string) {
  return email.split('@')[0];
}

function assertValidUsername(username: string) {
  const trimmed = (username ?? '').trim();
  if (trimmed.length < 3) {
    throw new Error('El usuario debe tener al menos 3 caracteres');
  }
  if (!/^[a-zA-Z0-9._-]+$/.test(trimmed)) {
    throw new Error('El usuario solo puede tener letras, números, puntos, guiones y guiones bajos (sin espacios ni @)');
  }
  return trimmed;
}

function assertValidPassword(password: string) {
  if (!password || password.length < 8) {
    throw new Error('La contraseña debe tener al menos 8 caracteres');
  }
}

export async function listStaff(): Promise<StaffMember[]> {
  const supabase = await getServiceSupabase();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, role, created_at')
    .order('created_at', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((p) => ({
    id: p.id,
    email: p.email,
    role: p.role,
    created_at: p.created_at,
    username: emailToUsername(p.email),
  }));
}

// Crea un empleado nuevo: usuario en Supabase Auth + fila en `profiles` con
// role = 'empleado' (nunca 'admin' - esto es a propósito, para que esta
// pantalla no se pueda usar para crear otro dueño).
export async function createEmployee(rawUsername: string, password: string): Promise<StaffMember> {
  const username = assertValidUsername(rawUsername);
  assertValidPassword(password);

  const supabase = await getServiceSupabase();
  const email = usernameToEmail(username);

  const { data: existing, error: existingError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle();
  if (existingError) throw existingError;
  if (existing) throw new Error('Ya existe un usuario con ese nombre');

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createError) throw createError;

  const { error: profileError } = await supabase
    .from('profiles')
    .insert({ id: created.user.id, email, role: 'empleado' });

  if (profileError) {
    // No dejamos un usuario de Auth "fantasma" sin perfil si esto falla.
    await supabase.auth.admin.deleteUser(created.user.id);
    throw profileError;
  }

  return {
    id: created.user.id,
    username,
    email,
    role: 'empleado',
    created_at: new Date().toISOString(),
  };
}

// Borra un empleado (nunca un admin, ni siquiera si alguien manda el id a
// mano) y su acceso al panel.
export async function deleteEmployee(id: string): Promise<void> {
  const supabase = await getServiceSupabase();

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!profile) throw new Error('Usuario no encontrado');
  if (profile.role === 'admin') {
    throw new Error('No se puede eliminar una cuenta de administrador desde acá');
  }

  // Borrar el usuario de auth.users cascadea el borrado de su fila en
  // `profiles` (FK ON DELETE CASCADE definida en el schema).
  const { error: deleteError } = await supabase.auth.admin.deleteUser(id);
  if (deleteError) throw deleteError;
}

export async function resetEmployeePassword(id: string, newPassword: string): Promise<void> {
  assertValidPassword(newPassword);

  const supabase = await getServiceSupabase();
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!profile) throw new Error('Usuario no encontrado');
  if (profile.role === 'admin') {
    throw new Error('No se puede restablecer la contraseña de un administrador desde acá');
  }

  const { error: updateError } = await supabase.auth.admin.updateUserById(id, { password: newPassword });
  if (updateError) throw updateError;
}
