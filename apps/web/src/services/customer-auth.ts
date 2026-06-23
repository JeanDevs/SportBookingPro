'use server';

import { redirect } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { createClient } from '../lib/supabase/server';

/**
 * Auth del CLIENTE final (account_type = customer). Comparte Supabase Auth con
 * el dueño pero marca `account_type` en metadata para que el trigger cree el
 * espejo correcto (`customer_accounts`) y el middleware enrute por zona.
 */

export interface AuthResult {
  error: string | null;
}

export interface CustomerSignUpInput {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export async function signUpCustomer({
  email,
  password,
  fullName,
  phone,
}: CustomerSignUpInput): Promise<AuthResult> {
  if (!fullName.trim()) return { error: 'Tu nombre es obligatorio.' };
  if (password.length < 6) return { error: 'La contraseña debe tener al menos 6 caracteres.' };

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName.trim(),
        phone: phone?.trim() || null,
        account_type: 'customer',
      },
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes('registered')) {
      return { error: 'Ese correo ya está registrado. Inicia sesión.' };
    }
    return { error: 'No se pudo completar el registro.' };
  }
  return { error: null };
}

export async function signInCustomer(email: string, password: string): Promise<AuthResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: 'Credenciales inválidas.' };
  return { error: null };
}

export async function signOutCustomer(): Promise<never> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}

export async function getCustomerUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const type = (user.user_metadata?.account_type as string) ?? 'owner';
  return type === 'customer' ? user : null;
}
