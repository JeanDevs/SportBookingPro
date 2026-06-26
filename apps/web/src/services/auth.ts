'use server';

import { redirect } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { createClient } from '../lib/supabase/server';

export interface AuthResult {
  error: string | null;
}

export interface SignUpInput {
  email: string;
  password: string;
  fullName: string;
}

/**
 * Inicia sesion contra Supabase Auth. La sesion se persiste en cookies
 * httpOnly por `@supabase/ssr`: nunca en localStorage/sessionStorage.
 */
export async function signIn(email: string, password: string): Promise<AuthResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: 'Credenciales invalidas.' };
  }

  return { error: null };
}

/**
 * Registro de propietario. `full_name` viaja en `options.data` para que el
 * trigger de la base de datos lo recoja al crear el perfil.
 */
export async function signUp({ email, password, fullName }: SignUpInput): Promise<AuthResult> {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, account_type: 'owner' },
    },
  });

  if (error) {
    return { error: 'No se pudo completar el registro.' };
  }

  // Supabase silently returns identities:[] when the email is already taken (their own
  // anti-enumeration design). We must NOT reveal this — returning success either way
  // ensures the registration endpoint leaks nothing. The middleware gates /panel on a
  // valid session, so an already-registered user is simply bounced to the login page.
  return { error: null };
}

/**
 * Cierra la sesion en Supabase (limpia la cookie httpOnly) y redirige al login
 * del panel del dueño.
 */
export async function signOut(): Promise<never> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/panel/ingresar');
}

/**
 * Envia un email de recuperacion de contraseña.
 */
export async function resetPassword(email: string): Promise<AuthResult> {
  const supabase = await createClient();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const options = appUrl
    ? { redirectTo: `${appUrl}/auth/callback?next=/panel/actualizar-clave` }
    : undefined;
  const { error } = await supabase.auth.resetPasswordForEmail(email, options);

  if (error) {
    return { error: 'No se pudo enviar el email de recuperacion.' };
  }

  return { error: null };
}

/**
 * Actualiza la contraseña del usuario autenticado. Tras el callback de
 * recuperacion la sesion ya vive en cookies httpOnly, asi que `updateUser`
 * opera sobre esa sesion mediante el server client.
 */
export async function updatePassword(newPassword: string): Promise<AuthResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    return { error: 'No se pudo actualizar la contraseña.' };
  }

  return { error: null };
}

/**
 * Devuelve el usuario autenticado actual (o null) leyendo la sesion desde el
 * server client (cookies httpOnly). Pensado para server components/actions.
 */
export async function getSessionUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
